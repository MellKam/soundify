import {
	checkIfUserFollowsArtist,
	checkIfUserFollowsPlaylist,
	checkIfUserFollowsUser,
	followArtist,
	followPlaylist,
	followUser,
	getCurrentUserProfile,
	getFollowedArtists,
	getUserProfile,
	getUserTopArtists,
	getUserTopTracks,
	unfollowArtist,
	unfollowPlaylist,
	unfollowUser,
} from "api/user/user.endpoints.ts";
import { client } from "api/test_env.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";

Deno.test("Must return current user profile", async () => {
	const currentUser = await getCurrentUserProfile(client);

	console.log(currentUser.display_name);
});

Deno.test("Must return user public profile", async () => {
	const user = await getUserProfile(client, "zksczw19rao4pcfdft6o7nn8g");

	console.log(user.display_name);
});

Deno.test("Must return user's top artist", async () => {
	const topArtists = await getUserTopArtists(client, {
		limit: 1,
	});

	console.log("Top artist is:", topArtists.items.at(0)?.name);
});

Deno.test("Must return user's top tracks", async () => {
	const topTracks = await getUserTopTracks(client, {
		limit: 1,
	});

	console.log("Top artist is:", topTracks.items.at(0)?.name);
});

Deno.test("Follow and unfollow playlist", async () => {
	const currentUser = await getCurrentUserProfile(client);

	const currentUserId = currentUser.id;
	const mockPlaylistID = "37i9dQZEVXbNG2KDcFcKOF";

	console.log("Follow playlist");
	await followPlaylist(
		client,
		"37i9dQZEVXbNG2KDcFcKOF",
	);

	let isFollow = await checkIfUserFollowsPlaylist(
		client,
		currentUserId,
		mockPlaylistID,
	);
	console.log("Does user follows playlist:", isFollow);
	assert(isFollow);

	console.log("Unfollow playlist");
	await unfollowPlaylist(
		client,
		"37i9dQZEVXbNG2KDcFcKOF",
	);

	isFollow = await checkIfUserFollowsPlaylist(
		client,
		currentUserId,
		mockPlaylistID,
	);
	console.log("Does user follows playlist:", isFollow);
	assert(!isFollow);
});

Deno.test("Must return followed artist", async () => {
	const artists = await getFollowedArtists(client);

	console.log(artists.items.at(0)?.name);
});

Deno.test("Follow and unfollow artist", async () => {
	const radioheadArtistID = "4Z8W4fKeB5YxbusRsdQVPb";
	console.log("Follow artist");
	await followArtist(
		client,
		radioheadArtistID,
	);

	let isFollow = await checkIfUserFollowsArtist(client, radioheadArtistID);
	console.log("Does user follows Radiohead:", isFollow);
	assert(isFollow);

	console.log("Unfollow artist");
	await unfollowArtist(
		client,
		radioheadArtistID,
	);

	isFollow = await checkIfUserFollowsArtist(client, radioheadArtistID);
	console.log("Does user follows Radiohead:", isFollow);
	assert(!isFollow);
});

Deno.test("Follow and unfollow user", async () => {
	const mockUserID = "zksczw19rao4pcfdft6o7nn8g";
	console.log("Follow user");
	await followUser(
		client,
		mockUserID,
	);

	let isFollow = await checkIfUserFollowsUser(client, mockUserID);
	console.log("Does user follows user:", isFollow);
	assert(isFollow);

	console.log("Unfollow user");
	await unfollowUser(
		client,
		mockUserID,
	);

	isFollow = await checkIfUserFollowsUser(client, mockUserID);
	console.log("Does user follows user:", isFollow);
	assert(!isFollow);
});
