import type { SimplifiedChapter } from "../chapter/chapter.types.ts";
import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { Audiobook, SimplifiedAudiobook } from "./audiobook.types.ts";

/**
 * Get Spotify catalog information for a single Audiobook.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the Audiobook
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getAudiobook(
	client: HTTPClient,
	audiobookId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Audiobook> {
	const res = await client.fetch("/v1/audiobooks/" + audiobookId, {
		query: { market },
	});
	return res.json() as Promise<Audiobook>;
}

/**
 * Get Spotify catalog information for multiple audiobooks identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleAudiobooks(
	client: HTTPClient,
	audiobookIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Audiobook[]> {
	const res = await client.fetch("/v1/audiobooks", {
		query: { market, ids: audiobookIds },
	});
	return (await res.json() as { audiobooks: Audiobook[] }).audiobooks;
}

export type GetAudiobookChapterOptions = Prettify<
	PagingOptions & MarketOptions
>;

/**
 * Get Spotify catalog information about an audiobook’s Chapters.
 * Optional parameters can be used to limit the number of Chapters returned.
 *
 * @param client Spotify HTTPClient
 * @param audiobookId The Spotify ID of the audiobook
 * @param options Additional option for request
 */
export async function getAudiobookChapters(
	client: HTTPClient,
	audiobookId: string,
	options?: GetAudiobookChapterOptions,
): Promise<PagingObject<SimplifiedChapter>> {
	const res = await client.fetch(`/v1/audiobooks/${audiobookId}/chapters`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedChapter>>;
}

export type GetSavedAudiobooksOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get a list of the audiobooks saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getSavedAudiobooks(
	client: HTTPClient,
	options?: GetSavedAudiobooksOptions,
): Promise<PagingObject<SimplifiedAudiobook>> {
	const res = await client.fetch("/v1/me/audiobooks", { query: options });
	return res.json() as Promise<PagingObject<SimplifiedAudiobook>>;
}

/**
 * Save one or more audiobooks to the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export function saveAudiobooks(
	client: HTTPClient,
	audiobookIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/audiobooks", {
		method: "PUT",
		query: { ids: audiobookIds },
	});
}

/**
 * Remove one or more audiobooks from the current user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export function removeSavedAudiobooks(
	client: HTTPClient,
	audiobookIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/audiobooks", {
		method: "DELETE",
		query: { ids: audiobookIds },
	});
}

/**
 * Check if one or more audiobooks is already saved in the current Spotify user's 'Your Audiobooks' library.
 *
 * @param client Spotify HTTPClient
 * @param audiobookIds List of the Spotify IDs for the audiobooks. Maximum: 20 IDs
 */
export async function checkIfAudiobooksSaved(
	client: HTTPClient,
	audiobookIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/audiobooks/contains", {
		query: { ids: audiobookIds },
	});
	return res.json() as Promise<boolean[]>;
}
