import { PagingObject } from "../shared.ts";
import { AlbumSimplified } from "../album/album.types.ts";
import { Artist } from "../artist/index.ts";
import { Track } from "../track/index.ts";

/**
 * Item types to search across.
 */
export type SearchType =
	| "album"
	| "artist"
	| "playlist"
	| "track"
	| "show"
	| "episode"
	| "audiobook";

export type SearchFilters =
	| "album"
	| "artist"
	| "track"
	| "year"
	| "upc"
	| "tag:hipster"
	| "tag:new"
	| "isrc"
	| "genre";

export interface SearchResponse {
	tracks: PagingObject<Track>;
	artists: PagingObject<Artist>;
	albums: PagingObject<AlbumSimplified>;
	// TODO playlist
	// TODO shows
	// TODO episodes
	// TODO audiobooks
}
