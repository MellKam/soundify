import { z } from "zod";
import {
	copyrightSchema,
	externalIdsSchema,
	pagingObjectSchema,
} from "../general.shemas.ts";
import { simplifiedArtistSchema } from "../artist/artist.schemas.ts";
import { simplifiedTrackSchema } from "../track/track.schemas.ts";
import { albumBaseSchema } from "./album.base.schemas.ts";

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
