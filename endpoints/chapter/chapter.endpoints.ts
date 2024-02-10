import type { HTTPClient } from "../../client.ts";
import type { Chapter } from "./chapter.types.ts";

/**
 * @param client Spotify HTTPClient
 * @param chapterId The Spotify ID of the chapter
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getChapter = async (
	client: HTTPClient,
	chapterId: string,
	market?: string,
) => {
	const res = await client.fetch("/v1/chapters/" + chapterId, {
		query: { market },
	});
	return res.json() as Promise<Chapter>;
};

/**
 * @param client Spotify HTTPClient
 * @param chapterIds List of the Spotify IDs of the chapters. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 * @returns
 */
export const getChapters = async (
	client: HTTPClient,
	chapterIds: string[],
	market?: string,
) => {
	const res = await client.fetch("/v1/chapters", {
		query: { market, ids: chapterIds },
	});
	return (await res.json() as { chapters: Chapter[] }).chapters;
};
