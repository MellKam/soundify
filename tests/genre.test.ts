import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { getAvailableGenres } from "../api/index.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get genres", async () => {
	const genres = await getAvailableGenres(client);
	console.log("Genres length:", genres.length);
});
