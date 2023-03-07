import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { getPlaylist } from "../api/index.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get playlist by id", async () => {
	const playlist = await getPlaylist(client, "37i9dQZEVXbNG2KDcFcKOF");
	console.log("Genres length:", playlist.name);
});
