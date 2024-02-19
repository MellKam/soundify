import type { HTTPClient } from "../../client.ts";
import type { Episode } from "./episode.types.ts";
import type { PagingObject, PagingOptions } from "../general.types.ts";
import type { Prettify } from "../../shared.ts";
import { SavedEpisode } from "./episode.types.ts";

/**
 * Get Spotify catalog informnation for a single episode.
 *
 * @param client Spotify HTTPClient
 * @param episodeId The Spotify ID of the episode
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getEpisode = async (
	client: HTTPClient,
	episodeId: string,
	market?: string,
): Promise<Episode> => {
	const res = await client.fetch("/v1/episodes/" + episodeId, {
		query: { market },
	});
	return res.json() as Promise<Episode>;
};

/**
 * Get spotify catalog information for multiple episodes identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs of the episodes. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getEpisodes = async (
	client: HTTPClient,
	episodeIds: string[],
	market?: string,
): Promise<Episode[]> => {
	const res = await client.fetch("/v1/episodes", {
		query: { market, ids: episodeIds },
	});
	return (await res.json() as { episodes: Episode[] }).episodes;
};

export type GetSavedEpisodesOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get a list of the episodes saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getSavedEpisodes = async (
	client: HTTPClient,
	options?: GetSavedEpisodesOpts,
): Promise<PagingObject<SavedEpisode>> => {
	const res = await client.fetch("/v1/me/episodes", { query: options });
	return res.json();
};

/**
 * Save one or more episodes to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const saveEpisodes = (
	client: HTTPClient,
	episodeIds: string[],
): Promise<Response> => {
	return client.fetch(`/v1/me/episodes`, {
		method: "PUT",
		query: { ids: episodeIds },
	});
};

/**
 * Save episode to the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeId The Spotify ID of the episode
 */
export const saveEpisode = (client: HTTPClient, episodeId: string): Promise<Response> => {
	return saveEpisodes(client, [episodeId]);
};

/**
 * Remove one or more episodes from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const removeSavedEpisodes = (
	client: HTTPClient,
	episodeIds: string[],
): Promise<Response> => {
	return client.fetch("/v1/me/episodes", {
		query: { ids: episodeIds },
	});
};

/**
 * Remove episode from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeId List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const removeSavedEpisode = (
	client: HTTPClient,
	episodeId: string,
): Promise<Response> => {
	return removeSavedEpisodes(client, [episodeId]);
};

/**
 * Check if one or more episodes is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const checkIfEpisodesSaved = async (
	client: HTTPClient,
	episodeIds: string[],
): Promise<boolean[]> => {
	const res = await client.fetch("/v1/me/episodes/contains", {
		query: { ids: episodeIds },
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check if epsisode is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeId The Spotify ID for the episode
 */
export const checkIfEpisodeSaved = async (
	client: HTTPClient,
	episodeId: string,
): Promise<boolean> => {
	return (await checkIfEpisodesSaved(client, [episodeId]))[0]!;
};
