import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { AlbumGroup, SimplifiedAlbum } from "../album/album.types.ts";
import type { Track } from "../track/track.types.ts";
import type { Artist } from "./artist.types.ts";

/**
 * Get Spotify catalog information for a single artist identified by their unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export async function getArtist(
	client: HTTPClient,
	artistId: string,
): Promise<Artist> {
	const res = await client.fetch("/v1/artists/" + artistId);
	return res.json() as Promise<Artist>;
}

/**
 * Get Spotify catalog information for several artists based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of the Spotify IDs for the artists. Maximum: 50 IDs.
 */
export async function getMultipleArtists(
	client: HTTPClient,
	artistIds: string[],
): Promise<Artist[]> {
	const res = await client.fetch("/v1/artists", { query: { ids: artistIds } });
	return ((await res.json()) as { artists: Artist[] }).artists;
}

export type GetArtistAlbumsOptions = Prettify<
	PagingOptions & MarketOptions & {
		/**
		 * List of keywords that will be used to filter the response.
		 * If not supplied, all album types will be returned.
		 */
		include_groups?: AlbumGroup[];
	}
>;

/**
 * Get Spotify catalog information about an artist's albums.
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export async function getArtistAlbums(
	client: HTTPClient,
	artistId: string,
	options?: GetArtistAlbumsOptions,
): Promise<PagingObject<SimplifiedAlbum>> {
	const res = await client.fetch(`/v1/artists/${artistId}/albums`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedAlbum>>;
}

/**
 * Get Spotify catalog information about an artist's top tracks by country.
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 * @param market An ISO 3166-1 alpha-2 country code.
 */
export async function getArtistTopTracks(
	client: HTTPClient,
	artistId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Track[]> {
	const res = await client.fetch(`/v1/artists/${artistId}/top-tracks`, {
		query: { market },
	});
	return ((await res.json()) as { tracks: Track[] }).tracks;
}

/**
 * Get Spotify catalog information about artists similar to a given artist.
 * Similarity is based on analysis of the Spotify community's listening history.
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export async function getArtistRelatedArtists(
	client: HTTPClient,
	artistId: string,
): Promise<Artist[]> {
	const res = await client.fetch(`/v1/artists/${artistId}/related-artists`);
	return ((await res.json()) as { artists: Artist[] }).artists;
}
