import { ChapterSimplified } from "../chapter/chapter.types";
import { HTTPClient } from "../client";
import { PagingObject, PagingOptions } from "../general.types";
import { Market } from "../market/market.types";
import { Audiobook, AudiobookSimplified } from "./audiobook.types";

/**
 * Get Spotify catalog information for a single Audiobook.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_id The Spotify ID of the Audiobook
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAudiobook = async (
  client: HTTPClient,
  audiobook_id: string,
  market?: Market
) => {
  return await client.fetch<Audiobook>("/audiobooks/" + audiobook_id, "json", {
    query: { market }
  });
};

/**
 * Get Spotify catalog information for multiple audiobooks identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_ids List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAudiobooks = async (
  client: HTTPClient,
  audiobook_ids: string[],
  market?: Market
) => {
  return (
    await client.fetch<{ audiobooks: Audiobook[] }>("/audiobooks", "json", {
      query: { market, ids: audiobook_ids }
    })
  ).audiobooks;
};

export interface GetAudiobookChapterOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get Spotify catalog information about an audiobook’s Chapters.
 * Optional parameters can be used to limit the number of Chapters returned.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_id The Spotify ID of the audiobook
 * @param opts Additional option for request
 */
export const getAudiobookChapters = async (
  client: HTTPClient,
  audiobook_id: string,
  opts?: GetAudiobookChapterOpts
) => {
  return await client.fetch<PagingObject<ChapterSimplified>>(
    `/audiobooks/${audiobook_id}/chapters`,
    "json",
    {
      query: opts
    }
  );
};

export interface GetSavedAudiobooksOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get a list of the audiobooks saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getSavedAudiobooks = async (
  client: HTTPClient,
  opts?: GetSavedAudiobooksOpts
) => {
  return await client.fetch<
    PagingObject<{
      /**
       * The date and time the audiobook was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
       */
      added_at: string;
      /**
       * Information about the audiobook.
       */
      audiobook: AudiobookSimplified;
    }>
  >("/me/audiobooks", "json", {
    query: opts
  });
};

/**
 * Save one or more audiobooks to the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobooks_ids List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const saveAudiobooks = async (
  client: HTTPClient,
  audiobooks_ids: string[]
) => {
  await client.fetch("/me/audiobooks", "void", {
    method: "PUT",
    query: { ids: audiobooks_ids }
  });
};

/**
 * Save audiobook to the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobooks_id The Spotify ID of the audiobook
 */
export const saveAudiobook = async (
  client: HTTPClient,
  audiobook_id: string
) => {
  await saveAudiobooks(client, [audiobook_id]);
};

/**
 * Remove one or more audiobooks from the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_ids List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const removeSavedAudiobooks = async (
  client: HTTPClient,
  audiobook_ids: string[]
) => {
  await client.fetch("/me/audiobooks", "void", {
    method: "DELETE",
    query: {
      ids: audiobook_ids
    }
  });
};

/**
 * Remove audiobook from the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_id The Spotify ID of the audiobook
 */
export const removeSavedAudiobook = async (
  client: HTTPClient,
  audiobook_id: string
) => {
  await removeSavedAudiobooks(client, [audiobook_id]);
};

/**
 * Check if one or more audiobooks is already saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_ids List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const checkSavedAudiobooks = async (
  client: HTTPClient,
  audiobook_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/audiobooks/contains", "json", {
    query: {
      ids: audiobook_ids
    }
  });
};

/**
 * Check if audiobook is already saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobook_id The Spotify ID of the Audiobook
 */
export const checkSavedAudiobook = async (
  client: HTTPClient,
  audiobook_id: string
) => {
  return (await checkSavedAudiobooks(client, [audiobook_id]))[0];
};
