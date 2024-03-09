import { Application, Router } from "oak";
import { renderToString } from "preact-render-to-string";
import { createAuthUrl, processCallback, refresh } from "./auth.ts";
import {
	calculatePKCECodeChallenge,
	generateRandomCodeVerifier,
	generateRandomState,
} from "oauth4webapi";
import { OAUTH_SCOPES } from "@soundify/web-api/auth";
import { getCurrentUser, SpotifyClient } from "@soundify/web-api";
import type { SecureCookieMap } from "oak/deps.ts";

const app = new Application();
const router = new Router();

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
		const result = await processCallback(
			ctx.request.url,
			codeVerifier,
			state,
		);
		if (!result.refresh_token) {
			throw new Error("Missing refresh_token");
		}

		await ctx.cookies.set("refresh_token", result.refresh_token, {
			httpOnly: true,
		});
		await ctx.cookies.set("access_token", result.access_token, {
			httpOnly: true,
		});

		ctx.response.redirect("/");
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

const createRefresher = (cookies: SecureCookieMap) => {
	return async () => {
		const refreshToken = await cookies.get("refresh_token");
		if (!refreshToken) {
			throw new Error("Missing refresh token");
		}

		const result = await refresh(refreshToken);
		if (!result.refresh_token) {
			throw new Error("Missing refresh_token");
		}

		await cookies.set("refresh_token", result.refresh_token, {
			httpOnly: true,
		});
		await cookies.set("access_token", result.access_token, {
			httpOnly: true,
		});

		return result.access_token;
	};
};

router.get("/", async (ctx) => {
	try {
		const accessToken = await ctx.cookies.get("access_token") || null;
		const spotifyClient = new SpotifyClient(accessToken, {
			refresher: createRefresher(ctx.cookies),
		});

		const user = await getCurrentUser(spotifyClient);

		ctx.response.type = "text/html";
		ctx.response.body = renderToString(
			<html>
				<head>
					<title>Soundify PKCE example</title>
				</head>
				<body>
					<h1>Soundify PKCE example</h1>
					<p>{`Hello, ${user.display_name}!`}</p>
				</body>
			</html>,
		);
	} catch (error) {
		const codeVerifier = generateRandomCodeVerifier();
		await ctx.cookies.set("code_verifier", codeVerifier, {
			httpOnly: true,
			path: "/callback",
		});

		const state = generateRandomState();
		await ctx.cookies.set("state", state, {
			httpOnly: true,
			path: "/callback",
		});

		const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
		const authUrl = createAuthUrl(
			codeChallenge,
			Object.values(OAUTH_SCOPES),
			state,
		);

		ctx.response.type = "text/html";
		ctx.response.body = renderToString(
			<html>
				<head>
					<title>Soundify PKCE example</title>
				</head>
				<body>
					<h1>Soundify PKCE example</h1>
					<a href={authUrl.toString()}>Login with Spotify</a>
				</body>
			</html>,
		);
	}
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
	"listen",
	({ hostname, port }) => console.log(`http://${hostname}:${port}/`),
);
await app.listen({ port: 3000 });
