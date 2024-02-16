import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";
import type { SimplifiedEpisode } from "../episode/episode.types.ts";
import type { PagingObject, PagingOptions } from "../general.types.ts";
import type { Show, SimplifiedShow } from "./show.types.ts";

/**
 * Get spotify catalog information for a single show by its unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getShow = async (
	client: HTTPClient,
	showId: string,
	market?: string,
) => {
	const res = await client.fetch("/v1/shows/" + showId, { query: { market } });
	return res.json() as Promise<Show>;
};

/**
 * Get spotify catalog information for multiple shows by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getShows = async (
	client: HTTPClient,
	showIds: string[],
	market?: string,
) => {
	const res = await client.fetch("/v1/shows", {
		query: { market, ids: showIds },
	});
	return ((await res.json()) as { shows: SimplifiedShow }).shows;
};

export type GetShowEpisodesOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get Spotify catalog information about an show's episodes.
 * Optional parameters can be used to limit the number of episodes returned.
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 * @param options Additional option for request
 */
export const getShowEpisodes = async (
	client: HTTPClient,
	showId: string,
	options?: GetShowEpisodesOpts,
) => {
	const res = await client.fetch(`/v1/shows/${showId}/episodes`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedEpisode>>;
};

export type GetSavedShowsOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get a list of shows saved in the current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getSavedShows = async (
	client: HTTPClient,
	options?: GetSavedShowsOpts,
) => {
	const res = await client.fetch("/v1/me/shows", { query: options });
	return res.json() as Promise<
		PagingObject<{
			/**
			 * The date and time the album was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
			 */
			added_at: string;
			/**
			 * Information about the show.
			 */
			show: Show;
		}>
	>;
};

/**
 * Save one or more shows to current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export const saveShows = (client: HTTPClient, showIds: string[]) => {
	return client.fetch("/v1/me/shows", {
		method: "PUT",
		query: { ids: showIds },
	});
};

/**
 * Save show to current Spotify user's library.
 *
 * @param client  Spotify HTTPClient
 * @param showId The Spotify ID of the show
 */
export const saveShow = (client: HTTPClient, showId: string) => {
	return saveShows(client, [showId]);
};

/**
 * Delete one or more shows from current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export const removeSavedShows = (client: HTTPClient, showIds: string[]) => {
	return client.fetch("/v1/me/shows", {
		method: "DELETE",
		query: {
			ids: showIds,
		},
	});
};

/**
 * Remove show from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 */
export const removeSavedShow = (client: HTTPClient, showId: string) => {
	return removeSavedShows(client, [showId]);
};

/**
 * Check if one or more shows is already saved in the current Spotify users' 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param showIds List of the Spotify IDs for the shows. Maximum: 20
 */
export const checkIfShowsSaved = async (
	client: HTTPClient,
	showIds: string[],
) => {
	const res = await client.fetch("/v1/me/shows/contains", {
		query: {
			ids: showIds,
		},
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check if show is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param showId The Spotify ID of the show
 */
export const checkIfShowSaved = async (client: HTTPClient, showId: string) => {
	return (await checkIfShowsSaved(client, [showId]))[0]!;
};
