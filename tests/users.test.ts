import {
	AuthCode,
	ClientCredentials,
	getUserProfile,
	getUserTopItems,
	SpotifyClient,
} from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

Deno.test("Test client credentials flow and get user profile", async () => {
	const client = new SpotifyClient({
		authProvider: new ClientCredentials.AuthProvider({
			client_id: env.SPOTIFY_CLIENT_ID,
			client_secret: env.SPOTIFY_CLIENT_SECRET,
		}),
	});

	const user = await getUserProfile(client, "zksczw19rao4pcfdft6o7nn8g");

	console.log(user.display_name);
});

Deno.test("Test auth code flow and get user's top artist", async () => {
	const client = new SpotifyClient({
		authProvider: new AuthCode.AuthProvider({
			client_id: env.SPOTIFY_CLIENT_ID,
			client_secret: env.SPOTIFY_CLIENT_SECRET,
			refresh_token: env.SPOTIFY_REFRESH_TOKEN,
		}),
	});

	const topArtists = await getUserTopItems(client, "artists", {
		limit: 1,
	});

	console.log("Top artist is: ", topArtists.items.at(0)?.name);
});
