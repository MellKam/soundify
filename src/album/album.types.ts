import type {
	Copyright,
	ExternalIds,
	ExternalUrls,
	Image,
	PagingObject,
	ReleaseDatePrecision,
	Restrictions,
} from "../general.types.ts";
import type { SimplifiedArtist } from "../artist/artist.types.ts";
import type { SimplifiedTrack } from "../track/track.types.ts";

export type AlbumType = "single" | "album" | "compilation" | "ep";
/**
 * **The field is present when getting an artist's albums.** \
 * Compare to `album_type` this field represents relationship between the artist and the album.
 */
export type AlbumGroup = AlbumType | "appears_on";

interface AlbumBase {
	album_type: AlbumType;
	/**
	 * The number of tracks in the album.
	 */
	total_tracks: number;
	/**
	 * The markets in which the album is available:
	 * ISO 3166-1 alpha-2 country codes.
	 */
	available_markets?: string[];
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the album.
	 */
	href: string;
	/**
	 * The Spotify ID for the album.
	 */
	id: string;
	/**
	 * The cover art for the album in various sizes, widest first.
	 */
	images: Image[];
	/**
	 * The name of the album.
	 *
	 * In case of an album takedown, the value may be an empty string.
	 */
	name: string;
	/**
	 * The date the album was first released.
	 */
	release_date: string;
	/**
	 * The precision with which `release_date` value is known.
	 */
	release_date_precision: ReleaseDatePrecision;
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: Restrictions;
	type: "album";
	/**
	 * The Spotify URI for the album.
	 */
	uri: string;
	is_playable?: boolean;
}

export interface SimplifiedAlbum extends AlbumBase {
	/**
	 * **The field is present when getting an artist's albums.** \
	 * Compare to `album_type` this field represents relationship between the artist and the album.
	 */
	album_group?: AlbumGroup;
	/**
	 * The artists of the album.
	 */
	artists: SimplifiedArtist[];
}

export interface Album extends AlbumBase {
	/**
	 * Known external IDs for the track.
	 */
	external_ids: ExternalIds;
	/**
	 * The copyright statements of the album.
	 */
	copyrights: Copyright[];
	/**
	 * A list of the genres the album is associated with.
	 * If not yet classified, the array is empty.
	 */
	genres: string[];
	/**
	 * The label associated with the album.
	 */
	label: string;
	/**
	 * The popularity of the artist.
	 * The value will be between 0 and 100, with 100 being the most popular.
	 */
	popularity: number;
	artists: SimplifiedArtist[];
	tracks: PagingObject<SimplifiedTrack>;
}

export type SavedAlbum = {
	/**
	 * The date and time the album was saved.
	 * Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
	 */
	added_at: string;
	album: Album;
};
