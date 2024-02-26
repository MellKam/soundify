import { albumSchema, savedAlbumSchema } from "./album.schemas.ts";
import { client } from "../../test_client.ts";
import {
	getAlbum,
	getMultipleAlbums,
	getNewReleases,
	getSavedAlbums,
} from "./album.endpoints.ts";
import type {
	Album,
	AlbumGroup,
	AlbumType,
	SavedAlbum,
	SimplifiedAlbum,
} from "./album.types.ts";
import { z } from "zod";
import { pagingObjectSchema } from "../general.shemas.ts";
import { AssertTrue, IsExact } from "std/testing/types.ts";
import { simplifiedAlbumSchema } from "./album.base.schemas.ts";
import { albumGroupEnum } from "./album.base.schemas.ts";
import { albumTypeEnum } from "./album.base.schemas.ts";

const MOCK_ALBUM_IDS = [
	"35UJLpClj5EDrhpNIi4DFg", // Radiohead - The Bends
	"7FqHuAvmREiIwVXVpZ9ooP", // Bring Me The Horizon - That's The Spirit
	"621cXqrTSSJi1WqDMSLmbL", // Twenty One Pilots - Trench
	"5U0pevIOTrPoDsN8YsBCBh", // Korn - Issues
	"3p7m1Pmg6n3BlpL9Py7IUA", // Bad Omens - THE DEATH OF PEACE OF MIND
	"5Eevxp2BCbWq25ZdiXRwYd", // Linkin Park - One More Light
	"0FZK97MXMm5mUQ8mtudjuK", // My Chemical Romance - The Black Parade
	"5b2m10WqNvZaD8eTEXGyfl", // Palaye Royale - The Bastards
	"4w3NeXtywU398NYW4903rY", // Queens of the Stone Age - Songs For The Deaf
	"2WT1pbYjLJciAR26yMebkH", // Pink Floyd - The Dark Side Of The Moon
];

const getRandomAlbumId = () => {
	const randomIndex = Math.floor(Math.random() * MOCK_ALBUM_IDS.length);
	return MOCK_ALBUM_IDS[randomIndex];
};

Deno.test("getAlbum", async () => {
	const album = await getAlbum(client, getRandomAlbumId());
	albumSchema.parse(album);
});

Deno.test("getAlbums", async () => {
	const albums = await getMultipleAlbums(client, MOCK_ALBUM_IDS);
	z.array(albumSchema).parse(albums);
});

Deno.test("getSavedAlbums", async () => {
	const savedAlbumsPage = await getSavedAlbums(client, { limit: 10 });
	pagingObjectSchema(savedAlbumSchema).parse(savedAlbumsPage);
});

Deno.test("getNewReleases", async () => {
	const newAlbumsPage = await getNewReleases(client, { limit: 10 });
	pagingObjectSchema(simplifiedAlbumSchema).parse(newAlbumsPage);
});

Deno.test("albumTypes", () => {
	type _t1 = AssertTrue<
		IsExact<z.infer<typeof simplifiedAlbumSchema>, SimplifiedAlbum>
	>;
	type _t2 = AssertTrue<IsExact<z.infer<typeof albumSchema>, Album>>;
	type _t3 = AssertTrue<IsExact<z.infer<typeof savedAlbumSchema>, SavedAlbum>>;
	type _t4 = AssertTrue<IsExact<z.infer<typeof albumGroupEnum>, AlbumGroup>>;
	type _t5 = AssertTrue<IsExact<z.infer<typeof albumTypeEnum>, AlbumType>>;
});
