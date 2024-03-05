import * as oauth from "oauth4webapi";
import { OAUTH_SCOPES } from "@soundify/web-api/auth";
import { z } from "zod";
import { load } from "std/dotenv/mod.ts";
import { Application, Router } from "oak";

await load({ export: true });

const env = z
	.object({
		SPOTIFY_CLIENT_ID: z.string(),
		SPOTIFY_REDIRECT_URI: z.string().url(),
	})
	.parse(Deno.env.toObject());

const issuer = new URL("https://accounts.spotify.com/");
const authServer = await oauth.processDiscoveryResponse(
	issuer,
	await oauth.discoveryRequest(issuer),
);

const oauthClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	token_endpoint_auth_method: "none",
};

class OAuthError extends Error {
	constructor(public readonly params: oauth.OAuth2Error) {
		super(
			params.error +
				(params.error_description ? " : " + params.error_description : ""),
		);
	}
}

async function createAuthUrl(codeVerifier: string, state: string) {
	const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

	const authUrl = new URL(authServer.authorization_endpoint!);
	for (
		const [key, value] of Object.entries({
			client_id: env.SPOTIFY_CLIENT_ID,
			redirect_uri: env.SPOTIFY_REDIRECT_URI,
			response_type: "code",
			code_challenge: codeChallenge,
			code_challenge_method: "S256",
			state,
			scope: Object.values(OAUTH_SCOPES).join(" "),
		})
	) {
		authUrl.searchParams.set(key, value);
	}

	return authUrl;
}

async function processOAuthCallback(
	url: URL,
	codeVerifier: string,
	expectedState: string,
) {
	const params = oauth.validateAuthResponse(
		authServer,
		oauthClient,
		url,
		expectedState,
	);

	if (oauth.isOAuth2Error(params)) {
		throw new OAuthError(params);
	}

	const response = await oauth.authorizationCodeGrantRequest(
		authServer,
		oauthClient,
		params,
		env.SPOTIFY_REDIRECT_URI,
		codeVerifier,
	);
	const result = await oauth.processAuthorizationCodeOAuth2Response(
		authServer,
		oauthClient,
		response,
	);

	if (oauth.isOAuth2Error(result)) {
		throw new OAuthError(result);
	}

	return result;
}

async function processRefresh(refreshToken: string) {
	const response = await oauth.refreshTokenGrantRequest(
		authServer,
		oauthClient,
		refreshToken,
	);
	const result = await oauth.processRefreshTokenResponse(
		authServer,
		oauthClient,
		response,
	);

	if (oauth.isOAuth2Error(result)) {
		throw new OAuthError(result);
	}

	return result;
}

const app = new Application();
const router = new Router();

router.get("/login", async (ctx) => {
	const codeVerifier = oauth.generateRandomCodeVerifier();
	await ctx.cookies.set("code_verifier", codeVerifier, {
		httpOnly: true,
		path: "/callback",
	});

	const state = oauth.generateRandomState();
	await ctx.cookies.set("state", state, {
		httpOnly: true,
		path: "/callback",
	});

	const authUrl = await createAuthUrl(codeVerifier, state);
	return ctx.response.redirect(authUrl);
});

router.get("/callback", async (ctx) => {
	const codeVerifier = await ctx.cookies.get("code_verifier");
	if (!codeVerifier) {
		ctx.response.status = 400;
		ctx.response.body = "Missing code_verifier";
		return;
	}
	const state = await ctx.cookies.get("state");
	if (!state) {
		ctx.response.status = 400;
		ctx.response.body = "Missing state";
		return;
	}

	try {
		const result = await processOAuthCallback(
			ctx.request.url,
			codeVerifier,
			state,
		);
		if (!result.refresh_token) {
			throw new Error("Missing refresh_token");
		}

		await ctx.cookies.set("refresh_token", result.refresh_token, {
			httpOnly: true,
			path: "/refresh",
		});
		await ctx.cookies.set("access_token", result.access_token, {
			httpOnly: true,
		});

		ctx.response.type = "application/json";
		ctx.response.body = JSON.stringify(result);
		ctx.response.status = 200;
	} catch (error) {
		console.log(error);
		ctx.response.status = 500;
		ctx.response.body = error.message;
	} finally {
		await ctx.cookies.delete("code_verifier", {
			httpOnly: true,
			path: "/callback",
		});
		await ctx.cookies.delete("state", {
			httpOnly: true,
			path: "/callback",
		});
	}
});

router.get("/refresh", async (ctx) => {
	const refreshToken = await ctx.cookies.get("refresh_token");
	if (!refreshToken) {
		ctx.response.status = 400;
		ctx.response.body = "Missing refresh token";
		return;
	}

	try {
		const result = await processRefresh(refreshToken);
		if (!result.refresh_token) {
			throw new Error("Missing refresh_token");
		}

		await ctx.cookies.set("refresh_token", result.refresh_token, {
			httpOnly: true,
			path: "/refresh",
		});
		await ctx.cookies.set("access_token", result.access_token, {
			httpOnly: true,
		});

		ctx.response.type = "application/json";
		ctx.response.body = JSON.stringify(result);
		ctx.response.status = 200;
	} catch (error) {
		console.log(error);
		ctx.response.status = 500;
		ctx.response.body = error.message;
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
	"listen",
	({ hostname, port }) => console.log(`http://${hostname}:${port}/login`),
);
await app.listen({ port: 3000 });
