import type { HTTPClient } from "../../client.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
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
export async function getAlbum(
	client: HTTPClient,
	albumId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Album> {
	const res = await client.fetch("/v1/albums/" + albumId, {
		query: { market },
	});
	return res.json() as Promise<Album>;
}

/**
 * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleAlbums(
	client: HTTPClient,
	albumIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Album[]> {
	const res = await client.fetch("/v1/albums", {
		query: { market, ids: albumIds },
	});
	return (await res.json() as { albums: Album[] }).albums;
}

export type GetAlbumTracksOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get Spotify catalog information about an album’s tracks.
 * Optional parameters can be used to limit the number of tracks returned.
 *
 * @param client Spotify HTTPClient
 * @param albumId The Spotify ID of the album
 * @param options Additional option for request
 */
export async function getAlbumTracks(
	client: HTTPClient,
	albumId: string,
	options?: GetAlbumTracksOptions,
): Promise<PagingObject<SimplifiedTrack>> {
	const res = await client.fetch(`/v1/albums/${albumId}/tracks`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedTrack>>;
}

export type GetSavedAlbumsOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get a list of the albums saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getSavedAlbums(
	client: HTTPClient,
	options?: GetSavedAlbumsOptions,
): Promise<PagingObject<SavedAlbum>> {
	const res = await client.fetch("/v1/me/albums", { query: options });
	return res.json() as Promise<PagingObject<SavedAlbum>>;
}

/**
 * Save one or more albums to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export function saveAlbums(
	client: HTTPClient,
	albumIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/albums", {
		method: "PUT",
		query: { ids: albumIds },
	});
}

/**
 * Remove one or more albums from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export function removeSavedAlbums(
	client: HTTPClient,
	albumIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/albums", {
		method: "DELETE",
		query: { ids: albumIds },
	});
}

/**
 * Check if one or more albums is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param albumIds List of the Spotify IDs for the albums. Maximum: 20 IDs
 */
export async function checkIfAlbumsSaved(
	client: HTTPClient,
	albumIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/albums/contains", {
		query: { ids: albumIds },
	});
	return res.json() as Promise<boolean[]>;
}

/**
 * Get a list of new album releases featured in Spotify (shown, for example, on a Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getNewReleases(
	client: HTTPClient,
	options?: PagingOptions,
): Promise<PagingObject<SimplifiedAlbum>> {
	const res = await client.fetch("/v1/browse/new-releases", { query: options });
	return ((await res.json()) as { albums: PagingObject<SimplifiedAlbum> })
		.albums;
}
