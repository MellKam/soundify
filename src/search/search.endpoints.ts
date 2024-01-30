import type { PagingObject } from "../general.types.ts";
import type { SimplifiedAlbum } from "../album/album.types.ts";
import type { Artist } from "../artist/artist.types.ts";
import type { Track } from "../track/track.types.ts";
import type { SimplifiedPlaylist } from "../playlist/playlist.types.ts";
import { HTTPClient } from "../client.ts";

/**
 * Item types to search across.
 */
export type SearchType = "album" | "artist" | "playlist" | "track";
// | "show"
// | "episode"
// | "audiobook"

type SearchResponseTypeMap = {
	album: "albums";
	artist: "artists";
	playlist: "playlists";
	track: "tracks";
};

export type SearchTypeLiteral<T extends SearchType | SearchType[]> = T extends
	SearchType[] ? Pick<SearchResponseTypeMap, T[number]>[T[number]]
	: T extends SearchType ? SearchResponseTypeMap[T]
	: never;

export type SearchResponse = {
	tracks: PagingObject<Track>;
	artists: PagingObject<Artist>;
	albums: PagingObject<SimplifiedAlbum>;
	playlists: PagingObject<SimplifiedPlaylist>;
};

export type SearchFilters = {
	q?: string;
	track?: string;
	artist?: string;
	album?: string;
	year?: number | string;
	genre?: string;
	upc?: number | string;
	isrc?: number | string;
	tag?: "hipster" | "new";
};

export type SearchOptions = {
	/**
	 * If `include_external=audio` is specified it signals that the client can play externally hosted audio content, and marks the content as playable in the response.
	 *
	 * By default externally hosted audio content is marked as unplayable in the response.
	 */
	include_external?: "audio";
	/**
	 * The maximum number of results to return in each item type.
	 * Minimum: 1. Maximum: 50.
	 *
	 * @default 20
	 */
	limit?: number;
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: string;
	/**
	 * The index of the first result to return. Use with limit to get the next page of search results.
	 * Minimum 0. Maximum 1000.
	 *
	 * @default 0
	 */
	offset?: number;
};

/**
 * Get Spotify catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks that match a keyword string.
 *
 * @param client Spotify HTTPClient
 * @param query Your search query
 * @param type One or multiple item types to search across
 * @param options Additional options for request
 */
export const search = async <T extends SearchType[] | SearchType>(
	client: HTTPClient,
	query: string | SearchFilters,
	type: T,
	options?: SearchOptions,
): Promise<Pick<SearchResponse, SearchTypeLiteral<T>>> => {
	let q = "";
	if (typeof query === "string") {
		q = query;
	} else {
		for (const key in query) {
			q += key === "q"
				? query[key]
				: `${key}:${query[key as keyof typeof query]}`;
		}
	}

	const res = await client.fetch("/v1/search", {
		query: { q: type, ...options },
	});
	return res.json() as Promise<SearchResponse>;
};
