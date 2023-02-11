import {
	AuthCodeService,
	ClientCredentialsService,
	getUserProfile,
	getUserTopItems,
} from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

Deno.test("Test client credentials flow and get user profile", async () => {
	const authService = new ClientCredentialsService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
	});

	const { access_token } = await authService.getAccessToken();

	const user = await getUserProfile({
		accessToken: access_token,
		user_id: "zksczw19rao4pcfdft6o7nn8g",
	});

	console.log(user.display_name);
});

Deno.test("Test auth code flow and get user's top artist", async () => {
	const authService = new AuthCodeService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
		SPOTIFY_REDIRECT_URI: "",
	});

	const { access_token } = await authService.getAccessByRefreshToken(
		env.SPOTIFY_REFRESH_TOKEN,
	);

	const top_artist = await getUserTopItems("artists", {
		accessToken: access_token,
		query: {
			limit: 1,
		},
	});

	console.log("Top artist is: ", top_artist.items[0].name);
});
