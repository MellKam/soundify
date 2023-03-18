import { client } from "api/test_env.ts";
import { assert } from "https://deno.land/std@0.180.0/testing/asserts.ts";
import {
	checkSavedTrack,
	getRecommendations,
	getSavedTracks,
	getTrack,
	getTrackAudioFeatures,
	getTracks,
	getTracksAudioAnalysis,
	removeSavedTrack,
	saveTrack,
} from "api/track/track.endpoints.ts";

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

Deno.test("Get track audio features", async () => {
	const trackID = "3bnVBN67NBEzedqQuWrpP4";
	const audioFeatures = await getTrackAudioFeatures(client, trackID);

	assert(audioFeatures.id === trackID);
});

Deno.test("Get track audio analysis", async () => {
	const trackID = "3bnVBN67NBEzedqQuWrpP4";
	const audioAnalysis = await getTracksAudioAnalysis(client, trackID);

	assert(typeof audioAnalysis === "object");
});

Deno.test("Get recommendations", async () => {
	const recommendations = await getRecommendations(client, {
		seed_artists: ["4Z8W4fKeB5YxbusRsdQVPb"],
		seed_genres: ["rock"],
		seed_tracks: ["70LcF31zb1H0PyJoS1Sx1r"],
	});

	assert(typeof recommendations === "object");
});
