import { PagingObject } from "api/general.types.ts";
import { AlbumSimplified } from "api/album/album.types.ts";
import { Artist } from "api/artist/artist.types.ts";
import { Track } from "api/track/track.types.ts";
import { PlaylistSimplified } from "api/playlist/playlist.types.ts";
import { JSONObject, SearchParams } from "../../shared/mod.ts";

/**
 * Item types to search across.
 */
export type SearchType =
	| "album"
	| "artist"
	| "playlist"
	| "track";
// | "show"
// | "episode"
// | "audiobook"

type SearchResponseType = "albums" | "artists" | "playlists" | "tracks";

interface SearchResponseTypeMap extends Record<SearchType, SearchResponseType> {
	album: "albums";
	artist: "artists";
	playlist: "playlists";
	track: "tracks";
}

export type SearchTypeLiteral<T extends SearchType | SearchType[]> = T extends
	SearchType[] ? Pick<SearchResponseTypeMap, T[number]>[T[number]]
	: T extends SearchType ? SearchResponseTypeMap[T]
	: never;

type SearchEntity =
	| Track
	| Artist
	| AlbumSimplified
	| PlaylistSimplified;

export interface SearchResponse
	extends JSONObject, Record<SearchResponseType, PagingObject<SearchEntity>> {
	tracks: PagingObject<Track>;
	artists: PagingObject<Artist>;
	albums: PagingObject<AlbumSimplified>;
	playlist: PagingObject<PlaylistSimplified>;
}

export interface SearchFilters extends SearchParams {
	q?: string;
	track?: string;
	artist?: string;
	album?: string;
	year?: number | string;
	genre?: string;
	upc?: number | string;
	isrc?: number | string;
	tag?: "hipster" | "new";
}
