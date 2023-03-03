import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import {
	checkSavedTrack,
	getSavedTracks,
	getTrack,
	getTracks,
	removeSavedTrack,
	saveTrack,
} from "../api/track/index.ts";

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

Deno.test("Get tracks by ids", async () => {
	const trackIDs = [
		"3bnVBN67NBEzedqQuWrpP4",
		"3dJj6o9o1fRgrojWjailuz",
		"7CAbF0By0Fpnbiu6Xn5ZF7",
	];
	const tracks = await getTracks(client, trackIDs);

	for (const track of tracks) {
		console.log(
			`${track.artists.map((a) => a.name).join(", ")} - ${track.name}`,
		);
	}
});

Deno.test("Get saved tracks", async () => {
	const savedTracks = await getSavedTracks(client, { limit: 5 });

	assert(savedTracks.items.length === 5);
});

Deno.test("Add and remove track from 'Your Music' library", async () => {
	const trackID = "3bnVBN67NBEzedqQuWrpP4";
	await saveTrack(client, trackID);

	let isSaved = await checkSavedTrack(client, trackID);
	assert(isSaved === true);
	console.log("after save isSaved:", isSaved);

	await removeSavedTrack(client, trackID);

	isSaved = await checkSavedTrack(client, trackID);
	assert(isSaved === false);
	console.log("after remove isSaved:", isSaved);
});
