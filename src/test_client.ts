import * as oauth from "https://deno.land/x/oauth4webapi@v2.8.1/mod.ts";
import { SPOTIFY_AUTH_URL } from "./mod.ts";
import { z } from "zod";
import { load } from "https://deno.land/std@0.213.0/dotenv/mod.ts";
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

	return data.access_token;
};

const accessToken = await refresher();

export const client = new SpotifyClient(accessToken, {
	onRateLimit: (timeout) => console.log(`Rate limit timeout ${timeout}ms`),
	waitForRateLimit: true,
	refresher,
});
