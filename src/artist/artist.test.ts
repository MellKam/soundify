import { getArtist, getSeveralArtists } from "./artist.endpoints.ts";
import { client } from "../test_client.ts";
import { artistSchema } from "./artist.schemas.ts";
import { simplifiedAlbumSchema } from "../album/album.schemas.ts";
import { z } from "zod";
import { getArtistAlbums } from "../mod.ts";
import { pagingObjectSchema } from "../general.shemas.ts";

const MOCK_ARTIST_IDS = [
	"0k17h0D3J5VfsdmQ1iZtE9", // Pink Floyd
	"4Z8W4fKeB5YxbusRsdQVPb", // Radiohead
	"1Ffb6ejR6Fe5IamqA5oRUF", // Bring Me The Horizon
	"3RNrq3jvMZxD9ZyoOZbQOD", // Korn
	"3YQKmKGau1PzlVlkL1iodx", // Twenty One Pilots
];

const getRandomArtistId = () => {
	const randomIndex = Math.floor(Math.random() * MOCK_ARTIST_IDS.length);
	return MOCK_ARTIST_IDS[randomIndex];
};

Deno.test("getArtist", async () => {
	const artist = await getArtist(client, getRandomArtistId());
	artistSchema.parse(artist);
});

Deno.test("getArtists", async () => {
	const artists = await getSeveralArtists(client, MOCK_ARTIST_IDS);
	z.array(artistSchema).parse(artists);
});

Deno.test("getArtistAlbums", async () => {
	const albumsPage = await getArtistAlbums(client, getRandomArtistId());
	pagingObjectSchema(simplifiedAlbumSchema).parse(albumsPage);
});
