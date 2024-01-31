import { z } from "zod";
import {
	copyrightSchema,
	externalIdsSchema,
	externalUrlsSchema,
	imageSchema,
	pagingObjectSchema,
	releaseDatePrecisionEnum,
	restrictionsSchema,
} from "../general.shemas.ts";
import { simplifiedArtistSchema } from "../artist/artist.schemas.ts";
import { simplifiedTrackSchema } from "../track/track.schemas.ts";

export const albumTypeEnum = z.enum([
	"single",
	"album",
	"compilation",
	"ep",
]);
export const albumGroupEnum = z.enum([
	...albumTypeEnum._def.values,
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
	release_date: z.string(),
	release_date_precision: releaseDatePrecisionEnum,
	restrictions: restrictionsSchema.optional(),
	type: z.literal("album"),
	uri: z.string(),
}).strict();

export const simplifiedAlbumSchema = z.object({
	album_group: albumGroupEnum.optional(),
	artists: z.array(simplifiedArtistSchema),
}).merge(albumBaseSchema).strict();

export const albumSchema = z.object({
	artists: z.array(simplifiedArtistSchema),
	tracks: pagingObjectSchema(simplifiedTrackSchema),
	external_ids: externalIdsSchema,
	copyrights: z.array(copyrightSchema),
	genres: z.array(z.string()),
	label: z.string(),
	popularity: z.number().min(0).max(100),
}).merge(albumBaseSchema).strict();

export const savedAlbumSchema = z.object({
	added_at: z.string(),
	album: albumSchema,
});
