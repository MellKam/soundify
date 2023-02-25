import {
	AuthCode,
	followPlaylist,
	getFollowedArtists,
	SpotifyClient,
	unfollowPlaylist,
} from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

const env = getTestEnv();

const client = new SpotifyClient({
	authProvider: new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
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
