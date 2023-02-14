import {
	AuthCodeService,
	ClientCredentialsService,
	getUserProfile,
	getUserTopItems,
} from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

Deno.test("Test client credentials flow and get user profile", async () => {
	const spotifyClient = new ClientCredentialsService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
	}).createClient();

	const user = await getUserProfile(spotifyClient, "zksczw19rao4pcfdft6o7nn8g");

	console.log(user.display_name);
	spotifyClient.removeExpireListener();
});

Deno.test("Test auth code flow and get user's top artist", async () => {
	const spotifyClient = new AuthCodeService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
		SPOTIFY_REDIRECT_URI: "",
	}).createClient({ refresh_token: env.SPOTIFY_REFRESH_TOKEN });

	const top_artist = await getUserTopItems(spotifyClient, "artists", {
		limit: 1,
	});

	console.log("Top artist is: ", top_artist.items[0].name);
	spotifyClient.removeExpireListener();
});
