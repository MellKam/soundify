import * as oauth from "https://deno.land/x/oauth4webapi@v2.8.1/mod.ts";
import {
	SPOTIFY_AUTH_URL,
	OAUTH_SCOPES,
	getCurrentUser,
	SpotifyClient,
} from "../../src/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { load } from "https://deno.land/std@0.213.0/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";

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
	await oauth.discoveryRequest(issuer)
);

const oauthClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
	token_endpoint_auth_method: "client_secret_basic",
};

const app = new Application();
const router = new Router();

router.get("/login", async (ctx) => {
	const codeVerifier = oauth.generateRandomCodeVerifier();
	const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

	await ctx.cookies.set("code_verifier", codeVerifier, {
		httpOnly: true,
		path: "/callback",
	});

	const authUrl = new URL(authServer.authorization_endpoint!);
	authUrl.searchParams.set("client_id", env.SPOTIFY_CLIENT_ID);
	authUrl.searchParams.set("redirect_uri", env.SPOTIFY_REDIRECT_URI);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("code_challenge", codeChallenge);
	authUrl.searchParams.set("code_challenge_method", "S256");
	authUrl.searchParams.set(
		"scope",
		[OAUTH_SCOPES.USER_READ_EMAIL, OAUTH_SCOPES.USER_READ_PRIVATE].join(" ")
	);

	return ctx.response.redirect(authUrl);
});

router.get("/callback", async (ctx) => {
	try {
		const params = oauth.validateAuthResponse(
			authServer,
			oauthClient,
			ctx.request.url,
			oauth.expectNoState
		);
		if (oauth.isOAuth2Error(params)) {
			console.log("error", params);
			throw new Error(); // Handle OAuth 2.0 redirect error
		}

		const codeVerifier = await ctx.cookies.get("code_verifier");
		if (!codeVerifier) {
			throw new Error("no code verifier");
		}

		const response = await oauth.authorizationCodeGrantRequest(
			authServer,
			oauthClient,
			params,
			env.SPOTIFY_REDIRECT_URI,
			codeVerifier
		);
		const result = await oauth.processAuthorizationCodeOAuth2Response(
			authServer,
			oauthClient,
			response
		);
		console.log(result);
		if (oauth.isOAuth2Error(result)) {
			throw new Error(result.error);
		}

		const spotifyClient = new SpotifyClient(result.access_token);
		const user = await getCurrentUser(spotifyClient);

		ctx.response.type = "application/json";
		ctx.response.body = JSON.stringify(user);
		ctx.response.status = 200;
	} catch (error) {
		console.log(error);
		ctx.response.status = 500;
		ctx.response.body = error.message;
	} finally {
		await ctx.cookies.delete("code_verifier");
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", (event) =>
	console.log(`http://${event.hostname}:${event.port}/login`)
);
await app.listen({ port: 3000 });
