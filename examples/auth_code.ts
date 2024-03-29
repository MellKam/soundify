import * as oauth from "oauth4webapi";
import { OAUTH_SCOPES, SPOTIFY_AUTH_URL } from "@soundify/web-api/auth";
import { z } from "zod";
import { load } from "std/dotenv/mod.ts";
import { encodeBase64Url } from "std/encoding/base64url.ts";
import { Application, Router } from "oak";

await load({ export: true });

const env = z
	.object({
		SPOTIFY_CLIENT_ID: z.string(),
		SPOTIFY_CLIENT_SECRET: z.string(),
		SPOTIFY_REDIRECT_URI: z.string().url(),
	})
	.parse(Deno.env.toObject());

const issuer = new URL(SPOTIFY_AUTH_URL);
const authServer = await oauth.processDiscoveryResponse(
	issuer,
	await oauth.discoveryRequest(issuer),
);

const oauthClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
	token_endpoint_auth_method: "client_secret_basic",
};

class OAuthError extends Error {
	constructor(public readonly params: oauth.OAuth2Error) {
		super(
			params.error +
				(params.error_description ? " : " + params.error_description : ""),
		);
	}
}

const app = new Application();
const router = new Router();

router.get("/login", async (ctx) => {
	const state = oauth.generateRandomState();
	await ctx.cookies.set("state", state, {
		httpOnly: true,
		path: "/callback",
	});

	const authUrl = new URL(authServer.authorization_endpoint!);
	authUrl.searchParams.set("client_id", env.SPOTIFY_CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", env.SPOTIFY_REDIRECT_URI);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("state", state);
	authUrl.searchParams.set("scope", Object.values(OAUTH_SCOPES).join(" "));

	return ctx.response.redirect(authUrl);
});

router.get("/callback", async (ctx) => {
	try {
		const state = await ctx.cookies.get("state");
		if (!state) {
			ctx.response.status = 400;
			ctx.response.body = "Missing state cookie";
			return;
		}

		const params = oauth.validateAuthResponse(
			authServer,
			oauthClient,
			ctx.request.url,
			state,
		);
		if (oauth.isOAuth2Error(params)) {
			throw new OAuthError(params);
		}

		// There is no ability to make authcode request without PKCE extension in the current version of oauth4webapi
		const response = await fetch(new URL("/api/token", SPOTIFY_AUTH_URL), {
			method: "POST",
			body: new URLSearchParams({
				grant_type: "authorization_code",
				redirect_uri: env.SPOTIFY_REDIRECT_URI,
				code: params.get("code")!,
			}),
			headers: {
				Authorization: "Basic " +
					encodeBase64Url(
						env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
					),
			},
		});

		const result = await oauth.processAuthorizationCodeOAuth2Response(
			authServer,
			oauthClient,
			response,
		);

		if (oauth.isOAuth2Error(result)) {
			throw new OAuthError(result);
		}

		if (!result.refresh_token) {
			throw new Error("Missing refresh token");
		}

		await ctx.cookies.set("refresh_token", result.refresh_token, {
			httpOnly: true,
			path: "/refresh",
		});

		ctx.response.type = "application/json";
		ctx.response.body = JSON.stringify(result);
		ctx.response.status = 200;
	} catch (error) {
		console.log(error);
		ctx.response.status = 500;
		ctx.response.body = error.message;
	} finally {
		await ctx.cookies.set("state", null, {
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
		ctx.response.status = 500;
		ctx.response.body = result.error + result.error_description
			? " : " + result.error_description
			: "";
		return;
	}

	ctx.response.type = "application/json";
	ctx.response.body = JSON.stringify(result);
	ctx.response.status = 200;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
	"listen",
	(event) => console.log(`http://${event.hostname}:${event.port}/login`),
);
await app.listen({ port: 3000 });
