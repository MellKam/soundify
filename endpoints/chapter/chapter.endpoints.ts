import type { HTTPClient } from "../../client.ts";
import type { Chapter } from "./chapter.types.ts";

/**
 * @description Get Spotify catalog information for a single audiobook chapter.
 *
 * @param client Spotify HTTPClient
 * @param chapterId The Spotify ID of the chapter
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getChapter(
	client: HTTPClient,
	chapterId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Chapter> {
	const res = await client.fetch("/v1/chapters/" + chapterId, {
		query: { market },
	});
	return res.json() as Promise<Chapter>;
}

/**
 * @description Get Spotify catalog information for several audiobook chapters identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param chapterIds List of the Spotify IDs of the chapters. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleChapters(
	client: HTTPClient,
	chapterIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Chapter[]> {
	const res = await client.fetch("/v1/chapters", {
		query: { market, ids: chapterIds },
	});
	return (await res.json() as { chapters: Chapter[] }).chapters;
}
