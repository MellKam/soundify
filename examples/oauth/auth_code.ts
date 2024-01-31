import * as oauth from "oauth4webapi";
import {
	getCurrentUser,
	OAUTH_SCOPES,
	SPOTIFY_AUTH_URL,
	SpotifyClient,
} from "../../src/mod.ts";
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
	authUrl.searchParams.set(
		"scope",
		Object.values(OAUTH_SCOPES).join(" "),
	);

	return ctx.response.redirect(authUrl);
});

router.get("/callback", async (ctx) => {
	try {
		const state = await ctx.cookies.get("state");
		if (!state) {
			throw new Error("no state found");
		}

		const params = oauth.validateAuthResponse(
			authServer,
			oauthClient,
			ctx.request.url,
			state,
		);
		if (oauth.isOAuth2Error(params)) {
			throw new Error(
				params.error + params.error_description
					? " : " + params.error_description
					: "",
			);
		}

		const response = await fetch(new URL("/api/token", SPOTIFY_AUTH_URL), {
			method: "POST",
			body: new URLSearchParams({
				grant_type: "authorization_code",
				redirect_uri: env.SPOTIFY_REDIRECT_URI,
				code: params.get("code")!,
			}),
			headers: {
				"Authorization": "Basic " +
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
		console.log(result.refresh_token);
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
		await ctx.cookies.set("state", null, {
			httpOnly: true,
			path: "/callback",
		});
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
	"listen",
	(event) => console.log(`http://${event.hostname}:${event.port}/login`),
);
await app.listen({ port: 3000 });
