import * as oauth from "oauth4webapi";
import { SPOTIFY_AUTH_URL } from "@soundify/web-api";
import { z } from "zod";
import { load } from "std/dotenv/mod.ts";
import { SpotifyClient } from "./client.ts";

await load({ export: true });

const env = z
	.object({
		SPOTIFY_CLIENT_ID: z.string(),
		SPOTIFY_CLIENT_SECRET: z.string(),
		SPOTIFY_REFRESH_TOKEN: z.string(),
	})
	.parse(Deno.env.toObject());

const issuer = new URL(SPOTIFY_AUTH_URL);
const authServer = await oauth.processDiscoveryResponse(
	issuer,
	await oauth.discoveryRequest(issuer),
);

const authClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
	token_endpoint_auth_method: "client_secret_basic",
};

const refresher = async () => {
	const res = await oauth.refreshTokenGrantRequest(
		authServer,
		authClient,
		env.SPOTIFY_REFRESH_TOKEN,
	);
	const data = await oauth.processRefreshTokenResponse(
		authServer,
		authClient,
		res,
	);

	if (oauth.isOAuth2Error(data)) {
		throw new Error(data.error + data.error_description);
	}

	await Deno.writeTextFile("/tmp/soundify_test_cache.txt", data.access_token);

	return data.access_token;
};

const refreshOrGetCachedToken = async () => {
	try {
		const token = await Deno.readTextFile("/tmp/soundify_test_cache.txt");
		return token;
	} catch (_) {
		return await refresher();
	}
};

const accessToken = await refreshOrGetCachedToken();

export const client = new SpotifyClient(accessToken, {
	waitForRateLimit: true,
	refresher,
});
