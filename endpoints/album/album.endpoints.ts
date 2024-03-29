import type { HTTPClient } from "../../client.ts";
import type { PagingObject, PagingOptions } from "../general.types.ts";
import type { SimplifiedTrack } from "../track/track.types.ts";
import type { Album, SavedAlbum, SimplifiedAlbum } from "./album.types.ts";
import type { Prettify } from "../../shared.ts";

/**
 * Get Spotify catalog information for a single album.
 *
 * @param client Spotify HTTPClient
 * @param albumId The Spotify ID of the album
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAlbum = async (
	client: HTTPClient,
	albumId: string,
	market?: string,
): Promise<Album> => {
	const res = await client.fetch("/v1/albums/" + albumId, {
		query: { market },
	});
	return res.json() as Promise<Album>;
};

/**
 * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getAlbums = async (
	client: HTTPClient,
	albumIds: string[],
	market?: string,
): Promise<Album[]> => {
	const res = await client.fetch("/v1/albums", {
		query: { market, ids: albumIds },
	});
	return (await res.json() as { albums: Album[] }).albums;
};

export type GetAlbumTrackOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get Spotify catalog information about an album’s tracks.
 * Optional parameters can be used to limit the number of tracks returned.
 *
 * @param client Spotify HTTPClient
 * @param albumId The Spotify ID of the album
 * @param options Additional option for request
 */
export const getAlbumTracks = async (
	client: HTTPClient,
	albumId: string,
	options?: GetAlbumTrackOpts,
): Promise<PagingObject<SimplifiedTrack>> => {
	const res = await client.fetch(`/v1/albums/${albumId}/tracks`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedTrack>>;
};

export type GetSavedAlbumsOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get a list of the albums saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getSavedAlbums = async (
	client: HTTPClient,
	options?: GetSavedAlbumsOpts,
): Promise<PagingObject<SavedAlbum>> => {
	const res = await client.fetch("/v1/me/albums", { query: options });
	return res.json() as Promise<PagingObject<SavedAlbum>>;
};

/**
 * Save one or more albums to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const saveAlbums = (
	client: HTTPClient,
	albumIds: string[],
): Promise<Response> => {
	return client.fetch("/v1/me/albums", {
		method: "PUT",
		query: { ids: albumIds },
	});
};

/**
 * Save album to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albums_id The Spotify ID of the album
 */
export const saveAlbum = (
	client: HTTPClient,
	albumId: string,
): Promise<Response> => {
	return saveAlbums(client, [albumId]);
};

/**
 * Remove one or more albums from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const removeSavedAlbums = (
	client: HTTPClient,
	albumIds: string[],
): Promise<Response> => {
	return client.fetch("/v1/me/albums", {
		method: "DELETE",
		query: { ids: albumIds },
	});
};

/**
 * Remove album from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumId The Spotify ID of the album
 */
export const removeSavedAlbum = (
	client: HTTPClient,
	albumId: string,
): Promise<Response> => {
	return removeSavedAlbums(client, [albumId]);
};

/**
 * Check if one or more albums is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export const checkIfAlbumsSaved = async (
	client: HTTPClient,
	albumIds: string[],
): Promise<boolean[]> => {
	const res = await client.fetch("/v1/me/albums/contains", {
		query: { ids: albumIds },
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check if album is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumId The Spotify ID of the album
 */
export const checkIfAlbumSaved = async (
	client: HTTPClient,
	albumId: string,
): Promise<boolean> => {
	return (await checkIfAlbumsSaved(client, [albumId]))[0]!;
};

export type GetNewReleasesOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * Provide this parameter if you want the list of returned items to be relevant to a particular country.
		 * If omitted, the returned items will be relevant to all countries.
		 */
		country?: string;
	}
>;

/**
 * Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getNewReleases = async (
	client: HTTPClient,
	options?: GetNewReleasesOpts,
): Promise<PagingObject<SimplifiedAlbum>> => {
	const res = await client.fetch("/v1/browse/new-releases", { query: options });
	return ((await res.json()) as { albums: PagingObject<SimplifiedAlbum> })
		.albums;
};
