import type { ItemType, PagingObject } from "../general.types.ts";
import type { SimplifiedAlbum } from "../album/album.types.ts";
import type { Artist } from "../artist/artist.types.ts";
import type { Track } from "../track/track.types.ts";
import type { SimplifiedPlaylist } from "../playlist/playlist.types.ts";
import type { HTTPClient } from "../client.ts";
import type { SimplifiedAudiobook } from "../audiobook/audiobook.types.ts";
import type { SimplifiedEpisode } from "../episode/episode.types.ts";
import type { SimplifiedShow } from "../show/show.types.ts";

type ItemTypeToResultKey = {
	album: "albums";
	artist: "artists";
	playlist: "playlists";
	track: "tracks";
	show: "shows";
	episode: "episodes";
	audiobook: "audiobooks";
};

type ItemTypesToSearchResultKeys<T extends ItemType | ItemType[]> = T extends
	ItemType[] ? Pick<ItemTypeToResultKey, T[number]>[T[number]]
	: T extends ItemType ? ItemTypeToResultKey[T]
	: never;

export type SearchResponse = {
	tracks: PagingObject<Track>;
	artists: PagingObject<Artist>;
	albums: PagingObject<SimplifiedAlbum>;
	playlists: PagingObject<SimplifiedPlaylist>;
	shows: PagingObject<SimplifiedShow>;
	audiobooks: PagingObject<SimplifiedAudiobook>;
	episodes: PagingObject<SimplifiedEpisode>;
};

export type SearchQueries = {
	q?: string;
	track?: string;
	artist?: string;
	album?: string;
	/** You can filter on a single year or a range (e.g. 1955-1960). */
	year?: number | string;
	genre?: string;
	upc?: number | string;
	isrc?: number | string;
	/**
	 * The `tag:new` filter will return albums released in the past two weeks and `tag:hipster` can be used to return only albums with the lowest 10% popularity.
	 */
	tag?: "hipster" | "new";
};

type ItemTypeQueries = {
	artists: "q" | "artist" | "genre" | "year";
	tracks: "q" | "artist" | "album" | "genre" | "isrc" | "year";
	albums: "q" | "artist" | "album" | "tag" | "year" | "upc";
	playlists: "q";
	shows: "q";
	audiobooks: "q";
	episodes: "q";
};

type SearchQueriesFromItemTypes<T extends ItemType[] | ItemType> = Pick<
	SearchQueries,
	ItemTypeQueries[
		ItemTypesToSearchResultKeys<T>
	]
>;

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
 * @param type One or multiple item types to search across
 * @param query Your search query
 * @param options Additional options for request
 */
export const search = async <T extends ItemType[] | ItemType>(
	client: HTTPClient,
	type: T,
	query: string | SearchQueriesFromItemTypes<T>,
	options?: SearchOptions,
): Promise<Pick<SearchResponse, ItemTypesToSearchResultKeys<T>>> => {
	const q = typeof query === "string" ? query : Object.entries(query)
		.map(([key, value]) => (key === "q" ? value : `${key}:${value}`))
		.join(" ");

	const res = await client.fetch("/v1/search", {
		query: { q, type, ...options },
	});
	return res.json() as Promise<SearchResponse>;
};
