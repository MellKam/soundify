import { HTTPClient } from "api/client.ts";
import { PagingObject, PagingOptions } from "api/general.types.ts";
import { AlbumGroup, AlbumSimplified } from "api/album/album.types.ts";
import { Market } from "api/market/market.types.ts";
import { Track } from "api/track/track.types.ts";
import { Artist } from "api/artist/artist.types.ts";
import { SearchParams } from "shared/mod.ts";

/**
 * Get Spotify catalog information for a single artist identified by their unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const getArtist = async (client: HTTPClient, artist_id: string) => {
	return await client.fetch<Artist>("/artists/" + artist_id, "json");
};

/**
 * Get Spotify catalog information for several artists based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param artist_ids List of the Spotify IDs for the artists. Maximum: 50 IDs.
 */
export const getArtists = async (
	client: HTTPClient,
	artist_ids: string[],
) => {
	return (await client.fetch<{ artists: Artist[] }>("/artists", "json", {
		query: {
			ids: artist_ids,
		},
	})).artists;
};

interface GetArtistAlbumsOpts extends PagingOptions, SearchParams {
	/**
	 * List of keywords that will be used to filter the response.
	 * If not supplied, all album types will be returned.
	 */
	include_groups: AlbumGroup[];
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: Market;
}

/**
 * Get Spotify catalog information about an artist's albums.
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const getArtistAlbums = async (
	client: HTTPClient,
	artist_id: string,
	opts?: GetArtistAlbumsOpts,
) => {
	return await client.fetch<PagingObject<AlbumSimplified>>(
		`/artists/${artist_id}/albums`,
		"json",
		{ query: opts },
	);
};

/**
 * Get Spotify catalog information about an artist's top tracks by country.
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 * @param market An ISO 3166-1 alpha-2 country code.
 */
export const getArtistTopTracks = async (
	client: HTTPClient,
	artist_id: string,
	market: Market, // TODO check if it must be required
) => {
	return (await client.fetch<{ tracks: Track[] }>(
		`/artists/${artist_id}/top-tracks`,
		"json",
		{
			query: {
				market,
			},
		},
	)).tracks;
};

/**
 * Get Spotify catalog information about artists similar to a given artist.
 * Similarity is based on analysis of the Spotify community's listening history.
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const getArtistRelatedArtists = async (
	client: HTTPClient,
	artist_id: string,
) => {
	return (await client.fetch<{ artists: Artist[] }>(
		`/artists/${artist_id}/related-artists`,
		"json",
	)).artists;
};
