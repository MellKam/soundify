import { HTTPClient } from "../client";
import { EpisodeSimplified } from "../episode/episode.types";
import { PagingObject, PagingOptions } from "../general.types";
import { Market } from "../market/market.types";
import { Show, ShowSimplified } from "./show.types";

/**
 * Get spotify catalog information for a single show by its unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param show_id The Spotify ID of the show
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getShow = async (
  client: HTTPClient,
  show_id: string,
  market?: Market
) => {
  return await client.fetch<Show>("/shows/" + show_id, "json", {
    query: { market }
  });
};

/**
 * Get spotify catalog information for multiple shows by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param show_ids List of the Spotify IDs for the shows. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getShows = async (
  client: HTTPClient,
  show_ids: string[],
  market?: Market
) => {
  return (
    await client.fetch<{ shows: ShowSimplified }>("/shows", "json", {
      query: { market, ids: show_ids }
    })
  ).shows;
};

export interface GetShowEpisodesOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get Spotify catalog information about an show's episodes.
 * Optional parameters can be used to limit the number of episodes returned.
 *
 * @param client Spotify HTTPClient
 * @param show_id The Spotify ID of the show
 * @param opts Additional option for request
 */
export const getShowEpisodes = async (
  client: HTTPClient,
  show_id: string,
  opts?: GetShowEpisodesOpts
) => {
  return await client.fetch<PagingObject<EpisodeSimplified>>(
    `/shows/${show_id}/episodes`,
    "json",
    {
      query: opts
    }
  );
};

export interface GetSavedShowsOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get a list of shows saved in the current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getSavedShows = async (
  client: HTTPClient,
  opts?: GetSavedShowsOpts
) => {
  return await client.fetch<
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
  >("/me/shows", "json", { query: opts });
};

/**
 * Save one or more shows to current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param shows_ids List of the Spotify IDs for the shows. Maximum: 20
 */
export const saveShows = async (client: HTTPClient, shows_ids: string[]) => {
  await client.fetch("/me/shows", "void", {
    method: "PUT",
    query: { ids: shows_ids }
  });
};

/**
 * Save show to current Spotify user's library.
 *
 * @param client  Spotify HTTPClient
 * @param show_id The Spotify ID of the show
 */
export const saveShow = async (client: HTTPClient, show_id: string) => {
  await saveShows(client, [show_id]);
};

/**
 * Delete one or more shows from current Spotify user's library.
 *
 * @param client Spotify HTTPClient
 * @param show_ids List of the Spotify IDs for the shows. Maximum: 20
 */
export const removeSavedShows = async (
  client: HTTPClient,
  show_ids: string[]
) => {
  await client.fetch("/me/shows", "void", {
    method: "DELETE",
    query: {
      ids: show_ids
    }
  });
};

/**
 * Remove show from the current user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param show_id The Spotify ID of the show
 */
export const removeSavedShow = async (client: HTTPClient, show_id: string) => {
  await removeSavedShows(client, [show_id]);
};

/**
 * Check if one or more shows is already saved in the current Spotify users' 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param show_ids List of the Spotify IDs for the shows. Maximum: 20
 */
export const checkSavedShows = async (
  client: HTTPClient,
  show_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/shows/contains", "json", {
    query: {
      ids: show_ids
    }
  });
};

/**
 * Check if show is already saved in the current Spotify user's 'Your Shows' library.
 *
 * @param client Spotify HTTPClient
 * @param show_id The Spotify ID of the show
 */
export const checkSavedShow = async (client: HTTPClient, show_id: string) => {
  return (await checkSavedShows(client, [show_id]))[0];
};
