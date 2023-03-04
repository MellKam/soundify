import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { getAvailableMarkets } from "../api/index.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get markets", async () => {
	const markets = await getAvailableMarkets(client);
	console.log("Markets length:", markets.length);
});
