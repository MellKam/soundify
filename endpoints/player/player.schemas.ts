import { z } from "zod";
import { externalUrlsSchema } from "../general.shemas.ts";
import { trackSchema } from "../track/track.schemas.ts";

export const deviceSchema = z.object({
	id: z.string().nullable(),
	is_active: z.boolean(),
	is_private_session: z.boolean(),
	is_restricted: z.boolean(),
	name: z.string(),
	type: z.string(),
	volume_percent: z.number().min(0).max(100).nullable(),
	supports_volume: z.boolean(),
});

const actionsSchema = z.object({
	interrupting_playback: z.boolean().optional(),
	pausing: z.boolean().optional(),
	resuming: z.boolean().optional(),
	seeking: z.boolean().optional(),
	skipping_next: z.boolean().optional(),
	skipping_prev: z.boolean().optional(),
	toggling_repeat_context: z.boolean().optional(),
	toggling_shuffle: z.boolean().optional(),
	toggling_repeat_track: z.boolean().optional(),
	transferring_playback: z.boolean().optional(),
});

export const contextSchema = z.object({
	type: z.string(),
	href: z.string(),
	external_urls: externalUrlsSchema,
	uri: z.string(),
});

export const playbackStateSchema = z.object({
	device: deviceSchema,
	repeat_state: z.enum(["off", "track", "context"]),
	shuffle_state: z.boolean(),
	context: contextSchema.nullable(),
	timestamp: z.number(),
	progress_ms: z.number().nullable(),
	is_playing: z.boolean(),
	item: z.any(),
	currently_playing_type: z.enum(["track", "episode", "ad", "unknown"]),
	actions: z.object({
		disallows: actionsSchema,
	}),
});

export const queueSchema = z.object({
	currently_playing: z.any().nullable(),
	queue: z.array(z.any()),
});

export const playHistoryObjectSchema = z.object({
	track: trackSchema,
	played_at: z.string(),
	context: contextSchema,
});
