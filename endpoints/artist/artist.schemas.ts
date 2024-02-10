import { z } from "zod";
import {
	externalUrlsSchema,
	followersSchema,
	imageSchema,
} from "../general.shemas.ts";

export const simplifiedArtistSchema = z.object({
	external_urls: externalUrlsSchema,
	href: z.string().url(),
	id: z.string(),
	name: z.string(),
	type: z.literal("artist"),
	uri: z.string(),
}).strict();

export const artistSchema = z.object({
	followers: followersSchema,
	genres: z.array(z.string()),
	images: z.array(imageSchema),
	popularity: z.number().min(0).max(100),
}).merge(simplifiedArtistSchema).strict();
