import { z, ZodType } from "zod";

export const pagingObjectSchema = <TItem extends ZodType>(itemSchema: TItem) =>
	z.object({
		href: z.string().url(),
		limit: z.number().positive(),
		next: z.string().url().nullable(),
		offset: z.number(),
		previous: z.string().url().nullable(),
		total: z.number().positive(),
		items: z.array(itemSchema),
	}).strict();

export const externalUrlsSchema = z.object({
	spotify: z.string().url(),
});

export const imageSchema = z.object({
	url: z.string().url(),
	height: z.number().nullable(),
	width: z.number().nullable(),
}).strict();

export const releaseDatePrecisionEnum = z.enum(["day", "month", "year"]);

export const restrictionsSchema = z.object({
	reason: z.enum(["market", "product", "explicit"]),
});

export const externalIdsSchema = z.object({
	isrc: z.string().optional(),
	ean: z.string().optional(),
	upc: z.string().optional(),
}).strict();

export const copyrightSchema = z.object({
	text: z.string(),
	type: z.enum(["C", "P"]),
}).strict();

export const resumePointSchema = z.object({
	fully_played: z.boolean(),
	resume_position_ms: z.number().positive(),
}).strict();

export const followersSchema = z.object({
	href: z.string().url().nullable(),
	total: z.number().positive(),
}).strict();

export const authorSchema = z.object({
	name: z.string(),
}).strict();

export const narratorSchema = z.object({
	name: z.string(),
}).strict();
