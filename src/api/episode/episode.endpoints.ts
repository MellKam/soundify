import { HTTPClient } from "../client";
import { Market } from "../market/market.types";
import { Episode } from "../episode/episode.types";
import { PagingObject, PagingOptions } from "../general.types";

/**
 * Get Spotify catalog informnation for a single episode.
 *
 * @param client Spotify HTTPClient
 * @param episode_id The Spotify ID of the episode
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getEpisode = async (
  client: HTTPClient,
  episode_id: string,
  market?: Market
) => {
  return await client.fetch<Episode>("/episodes/" + episode_id, "json", {
    query: { market }
  });
};

/**
 * Get spotify catalog information for multiple episodes identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param episodes_ids List of the Spotify IDs of the episodes. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getEpisodes = async (
  client: HTTPClient,
  episodes_ids: string[],
  market?: Market
) => {
  return (
    await client.fetch<{ episodes: Episode[] }>("/episodes", "json", {
      query: { market, ids: episodes_ids }
    })
  ).episodes;
};

export interface GetSavedEpisodesOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get a list of the episodes saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getSavedEpisodes = async (
  client: HTTPClient,
  opts?: GetSavedEpisodesOpts
) => {
  return await client.fetch<
    PagingObject<{
      /**
       * The date and time the episode was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
       */
      added_at: string;
      /**
       * Information about the episode.
       */
      episode: Episode;
    }>
  >("/me/episodes", "json", {
    query: opts
  });
};

/**
 * Save one or more episodes to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param episodes_ids List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const saveEpisodes = async (
  client: HTTPClient,
  episodes_ids: string[]
) => {
  await client.fetch("/me/episodes", "void", {
    method: "PUT",
    query: { ids: episodes_ids }
  });
};

/**
 * Save episode to the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episode_id The Spotify ID of the episode
 */
export const saveEpisode = async (client: HTTPClient, episode_id: string) => {
  await saveEpisodes(client, [episode_id]);
};

/**
 * Remove one or more episodes from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodes_ids List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const removeSavedEpisodes = async (
  client: HTTPClient,
  episodes_ids: string[]
) => {
  await client.fetch("/me/episodes", "void", {
    method: "DELETE",
    query: {
      ids: episodes_ids
    }
  });
};

/**
 * Remove episode from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodes_id List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const removeSavedEpisode = async (
  client: HTTPClient,
  episodes_id: string
) => {
  await removeSavedEpisodes(client, [episodes_id]);
};

/**
 * Check if one or more episodes is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episodes_ids List of the Spotify IDs for the episodes. Maximum: 20 IDs
 */
export const checkSavedEpisodes = async (
  client: HTTPClient,
  episodes_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/albums/contains", "json", {
    query: {
      ids: episodes_ids
    }
  });
};

/**
 * Check if epsisode is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param episode_id The Spotify ID for the episode
 */
export const checkSaveEpisode = async (
  client: HTTPClient,
  episode_id: string
) => {
  return (await checkSavedEpisodes(client, [episode_id]))[0];
};
