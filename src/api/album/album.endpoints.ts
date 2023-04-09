import { HTTPClient } from "../client";
import { PagingObject, PagingOptions } from "../general.types";
import { Market } from "../market/market.types";
import { TrackSimplified } from "../track/track.types";
import { Album, AlbumSimplified } from "../album/album.types";

/**
 * Get Spotify catalog information for a single album.
 *
 * @param client Spotify HTTPClient
 * @param album_id The Spotify ID of the album
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAlbum = async (
  client: HTTPClient,
  album_id: string,
  market?: Market
) => {
  return await client.fetch<Album>("/albums/" + album_id, "json", {
    query: { market },
  });
};

/**
 * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param album_ids List of the Spotify IDs for the albums. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAlbums = async (
  client: HTTPClient,
  album_ids: string[],
  market?: Market
) => {
  return (
    await client.fetch<{ albums: Album[] }>("/albums", "json", {
      query: { market, ids: album_ids },
    })
  ).albums;
};

export interface GetAlbumTrackOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get Spotify catalog information about an album’s tracks.
 * Optional parameters can be used to limit the number of tracks returned.
 *
 * @param client Spotify HTTPClient
 * @param album_id The Spotify ID of the album
 * @param opts Additional option for request
 */
export const getAlbumTracks = async (
  client: HTTPClient,
  album_id: string,
  opts?: GetAlbumTrackOpts
) => {
  return await client.fetch<PagingObject<TrackSimplified>>(
    `/albums/${album_id}/tracks`,
    "json",
    {
      query: opts,
    }
  );
};

export interface GetSavedAlbumsOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * If a country code is specified, only content that is available in that market will be returned.
   */
  market?: Market;
}

/**
 * Get a list of the albums saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getSavedAlbums = async (
  client: HTTPClient,
  opts?: GetSavedAlbumsOpts
) => {
  return await client.fetch<
    PagingObject<{
      /**
       * The date and time the album was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
       */
      added_at: string;
      /**
       * Information about the album.
       */
      album: Album;
    }>
  >("/me/albums", "json", {
    query: opts,
  });
};

/**
 * Save one or more albums to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albums_ids List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const saveAlbums = async (client: HTTPClient, albums_ids: string[]) => {
  await client.fetch("/me/albums", "void", {
    method: "PUT",
    query: { ids: albums_ids },
  });
};

/**
 * Save album to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albums_id The Spotify ID of the album
 */
export const saveAlbum = async (client: HTTPClient, album_id: string) => {
  await saveAlbums(client, [album_id]);
};

/**
 * Remove one or more albums from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param album_ids List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const removeSavedAlbums = async (
  client: HTTPClient,
  album_ids: string[]
) => {
  await client.fetch("/me/albums", "void", {
    method: "DELETE",
    query: {
      ids: album_ids,
    },
  });
};

/**
 * Remove album from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param album_id The Spotify ID of the album
 */
export const removeSavedAlbum = async (
  client: HTTPClient,
  album_id: string
) => {
  await removeSavedAlbums(client, [album_id]);
};

/**
 * Check if one or more albums is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param album_ids List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const checkSavedAlbums = async (
  client: HTTPClient,
  album_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/albums/contains", "json", {
    query: {
      ids: album_ids,
    },
  });
};

/**
 * Check if album is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param album_id The Spotify ID of the album
 */
export const checkSavedAlbum = async (client: HTTPClient, album_id: string) => {
  return (await checkSavedAlbums(client, [album_id]))[0];
};

export interface GetNewReleasesOpts extends PagingOptions {
  /**
   * An ISO 3166-1 alpha-2 country code.
   * Provide this parameter if you want the list of returned items to be relevant to a particular country.
   * If omitted, the returned items will be relevant to all countries.
   */
  country?: Market;
}

/**
 * Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getNewAlbumReleases = async (
  client: HTTPClient,
  opts?: GetNewReleasesOpts
) => {
  return (
    await client.fetch<{ albums: PagingObject<AlbumSimplified> }>(
      "/browse/new-releases",
      "json",
      {
        query: opts,
      }
    )
  ).albums;
};
