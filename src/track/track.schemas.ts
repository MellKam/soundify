import { z } from "zod";
import { simplifiedArtistSchema } from "../artist/artist.schemas.ts";
import { externalUrlsSchema } from "../general.shemas.ts";
import { restrictionsSchema } from "../general.shemas.ts";

const linkedTrack = z.object({
	external_urls: externalUrlsSchema,
	href: z.string().url(),
	id: z.string(),
	type: z.literal("track"),
	uri: z.string(),
}).strict();

export const simplifiedTrackSchema = z.object({
	artists: z.array(simplifiedArtistSchema),
	available_markets: z.array(z.string()),
	disc_number: z.number(),
	duration_ms: z.number(),
	explicit: z.boolean(),
	external_urls: externalUrlsSchema,
	href: z.string().url(),
	is_local: z.boolean(),
	is_playable: z.boolean().optional(),
	linked_from: linkedTrack.optional(),
	name: z.string(),
	preview_url: z.string().url().nullable(),
	restrictions: restrictionsSchema.optional(),
	track_number: z.number().positive(),
	id: z.string(),
	type: z.literal("track"),
	uri: z.string(),
}).strict();
