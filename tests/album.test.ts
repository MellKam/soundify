import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import {
	checkSavedAlbum,
	getAlbum,
	getAlbums,
	getAlbumTracks,
	getNewAlbumReleases,
	getSavedAlbums,
	removeSavedAlbum,
	saveAlbum,
} from "../api/index.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get album by ID", async () => {
	const mockAlbumID = "621cXqrTSSJi1WqDMSLmbL";
	const album = await getAlbum(client, mockAlbumID);
	console.log("Album:", album.name);
});

Deno.test("Get albums by IDs", async () => {
	const mockAlbumIDs = [
		"621cXqrTSSJi1WqDMSLmbL",
		"3cQO7jp5S9qLBoIVtbkSM1",
		"0Q5XBpCYFgUWiG9DUWyAmJ",
	];
	const albums = await getAlbums(client, mockAlbumIDs);

	for (const album of albums) {
		console.log(`Album: ${album.name}`);
	}
});

Deno.test("Get album tracks", async () => {
	const mockAlbumID = "621cXqrTSSJi1WqDMSLmbL";
	const tracks = await getAlbumTracks(client, mockAlbumID);

	tracks.items.forEach((track, i) => {
		console.log(`Track #${i + 1}: ${track.name}`);
	});
});

Deno.test("Get user's saved albums", async () => {
	const albums = await getSavedAlbums(client);

	albums.items.forEach(({ album }, i) => {
		console.log(`Saved album #${i + 1}: ${album.name}`);
	});
});

Deno.test("Save album", async () => {
	const albums = await getSavedAlbums(client);

	albums.items.forEach(({ album }, i) => {
		console.log(`Saved album #${i + 1}: ${album.name}`);
	});
});

Deno.test("Add and remove album from 'Your Music' library", async () => {
	const albumID = "4XHIjbhjRmqWlosjj5rqSI";
	await saveAlbum(client, albumID);

	let isSaved = await checkSavedAlbum(client, albumID);
	assert(isSaved === true);
	console.log("After save isSaved:", isSaved);

	await removeSavedAlbum(client, albumID);

	isSaved = await checkSavedAlbum(client, albumID);
	assert(isSaved === false);
	console.log("After remove isSaved:", isSaved);
});

Deno.test("Get new album releases", async () => {
	const albums = await getNewAlbumReleases(client, { limit: 5 });

	albums.items.forEach((album, i) => {
		console.log(`New album release #${i + 1}: ${album.name}`);
	});
});
