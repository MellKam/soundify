import {
	AuthCode,
	followPlaylist,
	getFollowedArtists,
	getUserProfile,
	getUserTopItems,
	SpotifyClient,
	unfollowPlaylist,
} from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Test client credentials flow and get user profile", async () => {
	const user = await getUserProfile(client, "zksczw19rao4pcfdft6o7nn8g");

	console.log(user.display_name);
});

Deno.test("Test auth code flow and get user's top artist", async () => {
	const topArtists = await getUserTopItems(client, "artists", {
		limit: 1,
	});

	console.log("Top artist is: ", topArtists.items.at(0)?.name);
});

Deno.test("Follow and unfollow playlist", async () => {
	await followPlaylist(
		client,
		"37i9dQZEVXbNG2KDcFcKOF",
	);

	await unfollowPlaylist(
		client,
		"37i9dQZEVXbNG2KDcFcKOF",
	);
});

Deno.test("Get followed artists", async () => {
	const artists = await getFollowedArtists(client);

	console.log(artists.artists.items.at(0)?.name);
});
