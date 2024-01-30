import type { SimplifiedChapter } from "../chapter/chapter.types.ts";
import type { HTTPClient } from "../client.ts";
import type { Prettify } from "../shared.ts";
import type { PagingObject, PagingOptions } from "../general.types.ts";
import type { Audiobook, SimplifiedAudiobook } from "./audiobook.types.ts";

/**
 * Get Spotify catalog information for a single Audiobook.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the Audiobook
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAudiobook = async (
	client: HTTPClient,
	audiobookId: string,
	market?: string,
) => {
	const res = await client.fetch("/v1/audiobooks/" + audiobookId, {
		query: { market },
	});
	return res.json() as Promise<Audiobook>;
};

/**
 * Get Spotify catalog information for multiple audiobooks identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAudiobooks = async (
	client: HTTPClient,
	audiobookIds: string[],
	market?: string,
) => {
	const res = await client.fetch("/v1/audiobooks", {
		query: { market, ids: audiobookIds },
	});
	return (await res.json() as { audiobooks: Audiobook[] }).audiobooks;
};

export type GetAudiobookChapterOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get Spotify catalog information about an audiobook’s Chapters.
 * Optional parameters can be used to limit the number of Chapters returned.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the audiobook
 * @param options Additional option for request
 */
export const getAudiobookChapters = async (
	client: HTTPClient,
	audiobookId: string,
	options?: GetAudiobookChapterOpts,
) => {
	const res = await client.fetch(`/audiobooks/${audiobookId}/chapters`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedChapter>>;
};

export type GetSavedAudiobooksOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get a list of the audiobooks saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getSavedAudiobooks = async (
	client: HTTPClient,
	options?: GetSavedAudiobooksOpts,
) => {
	const res = await client.fetch("/v1/me/audiobooks", { query: options });
	return res.json() as Promise<
		PagingObject<{
			/**
			 * The date and time the audiobook was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
			 */
			added_at: string;
			/**
			 * Information about the audiobook.
			 */
			audiobook: SimplifiedAudiobook;
		}>
	>;
};

/**
 * Save one or more audiobooks to the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const saveAudiobooks = (
	client: HTTPClient,
	audiobookIds: string[],
) => {
	return client.fetch("/v1/me/audiobooks", {
		method: "PUT",
		query: { ids: audiobookIds },
	});
};

/**
 * Save audiobook to the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobooks_id The Spotify ID of the audiobook
 */
export const saveAudiobook = (
	client: HTTPClient,
	audiobookId: string,
) => {
	return saveAudiobooks(client, [audiobookId]);
};

/**
 * Remove one or more audiobooks from the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const removeSavedAudiobooks = (
	client: HTTPClient,
	audiobookIds: string[],
) => {
	return client.fetch("/v1/me/audiobooks", {
		method: "DELETE",
		query: { ids: audiobookIds },
	});
};

/**
 * Remove audiobook from the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the audiobook
 */
export const removeSavedAudiobook = (
	client: HTTPClient,
	audiobookId: string,
) => {
	return removeSavedAudiobooks(client, [audiobookId]);
};

/**
 * Check if one or more audiobooks is already saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export const checkIfAudiobooksSaved = async (
	client: HTTPClient,
	audiobookIds: string[],
) => {
	const res = await client.fetch("/v1/me/audiobooks/contains", {
		query: { ids: audiobookIds },
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check if audiobook is already saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the Audiobook
 */
export const checkIfAudiobookSaved = async (
	client: HTTPClient,
	audiobookId: string,
) => {
	return (await checkIfAudiobooksSaved(client, [audiobookId]))[0]!;
};
