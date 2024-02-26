import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";
import type { SimplifiedEpisode } from "../episode/episode.types.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { SavedShow, Show, SimplifiedShow } from "./show.types.ts";

/**
 * Get spotify catalog information for a single show by its unique Spotify ID.
 *
 * @requires `user-read-playback-position`
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getShow(
	client: HTTPClient,
	showId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Show> {
	const res = await client.fetch("/v1/shows/" + showId, { query: { market } });
	return res.json() as Promise<Show>;
}

/**
 * Get spotify catalog information for multiple shows by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleShows(
	client: HTTPClient,
	showIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<SimplifiedShow> {
	const res = await client.fetch("/v1/shows", {
		query: { market, ids: showIds },
	});
	return ((await res.json()) as { shows: SimplifiedShow }).shows;
}

export type GetShowEpisodesOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get Spotify catalog information about an show's episodes.
 * Optional parameters can be used to limit the number of episodes returned.
 *
 * @requires `user-read-playback-position`
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 * @param options Additional option for request
 */
export async function getShowEpisodes(
	client: HTTPClient,
	showId: string,
	options?: GetShowEpisodesOptions,
): Promise<PagingObject<SimplifiedEpisode>> {
	const res = await client.fetch(`/v1/shows/${showId}/episodes`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedEpisode>>;
}

export type GetSavedShowsOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get a list of shows saved in the current Spotify user's library.
 *
 * @requires `user-library-read`
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getSavedShows(
	client: HTTPClient,
	options?: GetSavedShowsOptions,
): Promise<PagingObject<SavedShow>> {
	const res = await client.fetch("/v1/me/shows", { query: options });
	return res.json() as Promise<PagingObject<SavedShow>>;
}

/**
 * Save one or more shows to current Spotify user's library.
 *
 * @requires `user-library-modify`
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export function saveShows(
	client: HTTPClient,
	showIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/shows", {
		method: "PUT",
		query: { ids: showIds },
	});
}

/**
 * Delete one or more shows from current Spotify user's library.
 *
 * @requires `user-library-modify`
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export function removeSavedShows(
	client: HTTPClient,
	showIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/shows", {
		method: "DELETE",
		query: {
			ids: showIds,
		},
	});
}

/**
 * Check if one or more shows is already saved in the current Spotify users' 'Your Shows' library.
 *
 * @requires `user-library-read`
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export async function checkIfShowsSaved(
	client: HTTPClient,
	showIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/shows/contains", {
		query: {
			ids: showIds,
		},
	});
	return res.json() as Promise<boolean[]>;
}
