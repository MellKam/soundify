import type {
	Copyright,
	ExternalIds,
	ExternalUrls,
	Image,
	PagingObject,
	ReleaseDatePrecision,
} from "../general.types.ts";
import type { SimplifiedArtist } from "../artist/artist.types.ts";
import type { SimplifiedTrack } from "../track/track.types.ts";

export type AlbumType = "single" | "album" | "compilation" | "ep";

type AlbumRestriction = {
	/**
	 * @description The reason for the restriction. Albums may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content.
	 * Additional reasons may be added in the future.
	 */
	// deno-lint-ignore ban-types
	reason?: "market" | "product" | "explicit" | (string & {});
};

interface AlbumBase {
	album_type: AlbumType;
	/**
	 * @description The number of tracks in the album.
	 * @example 9
	 */
	total_tracks: number;
	/**
	 * @description The markets in which the album is available: [ISO 3166-1 alpha-2 country codes](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2). _**NOTE**: an album is considered available in a market when at least 1 of its tracks is available in that market._
	 *
	 * @example ["CA", "BR", "IT"]
	 */
	available_markets?: string[];
	/** @description Known external URLs for this album. */
	external_urls: ExternalUrls;
	/** @description A link to the Web API endpoint providing full details of the album. */
	href: string;
	/**
	 * @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the album.
	 *
	 * @example 2up3OPMp9Tb4dAKM2erWXQ
	 */
	id: string;
	/** @description The cover art for the album in various sizes, widest first. */
	images: Image[];
	/**
	 * @description The name of the album. \
	 * In case of an album takedown, the value may be an empty string.
	 */
	name: string;
	/**
	 * @description The date the album was first released.
	 *
	 * @example 1981-12
	 */
	release_date: string;
	/**
	 * @description The precision with which `release_date` value is known.
	 *
	 * @example year
	 */
	release_date_precision: ReleaseDatePrecision;
	/** @description Included in the response when a content restriction is applied. */
	restrictions?: AlbumRestriction;
	/** @description The object type. */
	type: "album";
	/**
	 * @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the album.
	 *
	 * @example "spotify:album:2up3OPMp9Tb4dAKM2erWXQ"
	 */
	uri: string;
	is_playable?: boolean;
}

export interface SimplifiedAlbum extends AlbumBase {
	/**
	 * The artists of the album.
	 */
	artists: SimplifiedArtist[];
}

/**
 * **The field is present when getting an artist's albums.** \
 * Compare to `album_type` this field represents relationship between the artist and the album.
 */
export type AlbumGroup = AlbumType | "appears_on";

export interface ArtistDiscographyAlbum extends SimplifiedAlbum {
	/**
	 * @description This field describes the relationship between the artist and the album.
	 */
	album_group: AlbumGroup;
}

export interface Album extends AlbumBase {
	/** @description Known external IDs for the album. */
	external_ids: ExternalIds;
	/** @description The copyright statements of the album. */
	copyrights: Copyright[];
	/**
	 * @description A list of the genres the album is associated with. If not yet classified, the array is empty.
	 *
	 * @example ["Egg punk", "Noise rock"]
	 */
	genres: string[];
	/** @description The label associated with the album. */
	label: string;
	/** @description The popularity of the album. The value will be between 0 and 100, with 100 being the most popular. */
	popularity: number;
	/** @description The artists of the album. Each artist object includes a link in `href` to more detailed information about the artist. */
	artists: SimplifiedArtist[];
	/** @description The tracks of the album. */
	tracks: PagingObject<SimplifiedTrack>;
}

export type SavedAlbum = {
	/**
	 * @description The date and time the album was saved
	 * Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
	 * If the time is imprecise (for example, the date/time of an album release), an additional field indicates the precision; see for example, release_date in an album object.
	 */
	added_at: string;
	/** @description Information about the album. */
	album: Album;
};
