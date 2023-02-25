import { AuthCode, followPlaylist, SpotifyClient } from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

Deno.test("Follow playlist", async () => {
	const client = new SpotifyClient({
		authProvider: new AuthCode.AuthProvider({
			client_id: env.SPOTIFY_CLIENT_ID,
			client_secret: env.SPOTIFY_CLIENT_SECRET,
			refresh_token: env.SPOTIFY_REFRESH_TOKEN,
		}),
	});

	await followPlaylist(
		client,
		"37i9dQZEVXbNG2KDcFcKOF",
	);
});
