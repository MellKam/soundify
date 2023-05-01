import { HTTPClient } from "../client";
import { Market } from "../market/market.types";
import { Chapter } from "./chapter.types";

/**
 *
 * @param client Spotify HTTPClient
 * @param chapter_id The Spotify ID of the chapter
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getChapter = async (
  client: HTTPClient,
  chapter_id: string,
  market?: Market
) => {
  return await client.fetch<Chapter>("/chapters/" + chapter_id, "json", {
    query: { market }
  });
};

/**
 *
 * @param client Spotify HTTPClient
 * @param chapter_ids List of the Spotify IDs of the chapters. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 * @returns
 */
export const getChapters = async (
  client: HTTPClient,
  chapter_ids: string[],
  market?: Market
) => {
  return (
    await client.fetch<{ chapters: Chapter[] }>("/chapters", "json", {
      query: { market, ids: chapter_ids }
    })
  ).chapters;
};
