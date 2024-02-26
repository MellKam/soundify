import type { HTTPClient } from "../../client.ts";
import type { Episode, SavedEpisode } from "./episode.types.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { Prettify } from "../../shared.ts";

/**
 * Get Spotify catalog informnation for a single episode.
 *
 * @param client Spotify HTTPClient
 * @param episodeId The Spotify ID of the episode
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getEpisode(
	client: HTTPClient,
	episodeId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Episode> {
	const res = await client.fetch("/v1/episodes/" + episodeId, {
		query: { market },
	});
	return res.json() as Promise<Episode>;
}

/**
 * Get spotify catalog information for multiple episodes identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs of the episodes. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleEpisodes(
	client: HTTPClient,
	episodeIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Episode[]> {
	const res = await client.fetch("/v1/episodes", {
		query: { market, ids: episodeIds },
	});
	return (await res.json() as { episodes: Episode[] }).episodes;
}

export type GetSavedEpisodesOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get a list of the episodes saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getSavedEpisodes(
	client: HTTPClient,
	options?: GetSavedEpisodesOptions,
): Promise<PagingObject<SavedEpisode>> {
	const res = await client.fetch("/v1/me/episodes", { query: options });
	return res.json();
}

/**
 * Save one or more episodes to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export function saveEpisodes(
	client: HTTPClient,
	episodeIds: string[],
): Promise<Response> {
	return client.fetch(`/v1/me/episodes`, {
		method: "PUT",
		query: { ids: episodeIds },
	});
}

/**
 * Remove one or more episodes from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export function removeSavedEpisodes(
	client: HTTPClient,
	episodeIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/episodes", {
		query: { ids: episodeIds },
	});
}

/**
 * Check if one or more episodes is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodeIds List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export async function checkIfEpisodesSaved(
	client: HTTPClient,
	episodeIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/episodes/contains", {
		query: { ids: episodeIds },
	});
	return res.json() as Promise<boolean[]>;
}
