import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { getTrack } from "../api/track/index.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get track by id", async () => {
	const trackID = "3bnVBN67NBEzedqQuWrpP4";
	const track = await getTrack(client, trackID);

	console.log(track.name);
});
