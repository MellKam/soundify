import { z } from "zod";
import {
	copyrightSchema,
	externalIdsSchema,
	externalUrlsSchema,
	imageSchema,
	releaseDatePrecisionEnum,
	restrictionsSchema,
} from "../general.shemas.ts";

export const albumTypeEnum = z.enum([
	"single",
	"album",
	"compilation",
]);
export const albumGroupEnum = z.enum([
	"single",
	"album",
	"compilation",
	"appears_on",
]);

const albumBaseSchema = z.object({
	album_type: albumTypeEnum,
	total_tracks: z.number().positive(),
	available_markets: z.array(z.string()),
	external_urls: externalUrlsSchema,
	href: z.string().url(),
	id: z.string(),
	images: z.array(imageSchema),
	name: z.string(),
	release_date: z.coerce.date(),
	release_date_precision: releaseDatePrecisionEnum,
	restrictions: restrictionsSchema.optional(),
	type: z.literal("album"),
	uri: z.string(),
	external_ids: externalIdsSchema,
	copyrights: z.array(copyrightSchema),
	genres: z.array(z.string()),
	label: z.string(),
	popularity: z.number(),
});

export const simplifiedAlbumSchema = z.object({
	album_group: albumGroupEnum.optional(),
	artists: z.unknown(), // simplified artist
}).merge(albumBaseSchema);

export const albumSchema = z.object({
	// artists: Artist[];
	// tracks: PagingObject<SimplifiedTrack>;
}).merge(albumBaseSchema);

export const savedAlbumSchema = z.object({
	added_at: z.coerce.date(),
	album: albumSchema,
});
