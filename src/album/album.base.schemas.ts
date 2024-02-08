import { z } from "zod";
import {
	externalUrlsSchema,
	imageSchema,
	releaseDatePrecisionEnum,
	restrictionsSchema,
} from "../general.shemas.ts";
import { simplifiedArtistSchema } from "../artist/artist.schemas.ts";

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

export const albumBaseSchema = z.object({
	album_type: albumTypeEnum,
	total_tracks: z.number().positive(),
	available_markets: z.array(z.string()).optional(),
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
	// not sure about that one
	is_playable: z.boolean().optional(),
}).strict();

export const simplifiedAlbumSchema = z.object({
	album_group: albumGroupEnum.optional(),
	artists: z.array(simplifiedArtistSchema),
}).merge(albumBaseSchema).strict();
