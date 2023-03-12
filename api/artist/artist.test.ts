import { client } from "api/test_env.ts";
import {
	getArtist,
	getArtistAlbums,
	getArtistRelatedArtists,
	getArtists,
	getArtistTopTracks,
} from "api/artist/artist.endpoints.ts";

Deno.test("Get artist by ID", async () => {
	const radioheadArtistID = "4Z8W4fKeB5YxbusRsdQVPb";
	const artist = await getArtist(client, radioheadArtistID);

	console.log("Artist name:", artist.name);
});

Deno.test("Get artists by IDs", async () => {
	const mockArtistIDs = [
		"4Z8W4fKeB5YxbusRsdQVPb",
		"6XyY86QOPPrYVGvF9ch6wz",
		"3YQKmKGau1PzlVlkL1iodx",
	];
	const artists = await getArtists(client, mockArtistIDs);

	for (const artist of artists) {
		console.log(`Artist - ${artist.name}`);
	}
});

Deno.test("Get artist's albums", async () => {
	const radioheadArtistID = "4Z8W4fKeB5YxbusRsdQVPb";
	const radioheadAlbums = await getArtistAlbums(client, radioheadArtistID, {
		include_groups: ["album"],
	});

	for (const album of radioheadAlbums.items) {
		console.log(
			`Album [${new Date(album.release_date).getFullYear()}]: ${album.name}`,
		);
	}
});

Deno.test("Get artist's top tracks", async () => {
	const radioheadArtistID = "4Z8W4fKeB5YxbusRsdQVPb";
	const radioheadTopTracks = await getArtistTopTracks(
		client,
		radioheadArtistID,
		"from_token",
	);

	radioheadTopTracks.forEach((track, i) => {
		console.log(`Track #${i + 1}: ${track.name}`);
	});
});

Deno.test("Get artist's related artists", async () => {
	const radioheadArtistID = "4Z8W4fKeB5YxbusRsdQVPb";
	const artists = await getArtistRelatedArtists(
		client,
		radioheadArtistID,
	);

	artists.forEach((track, i) => {
		console.log(`Artist #${i + 1}: ${track.name}`);
	});
});
