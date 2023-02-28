import { Artist, ArtistSimplified } from "../artist/index.ts";
import {
	ExternalIds,
	ExternalUrls,
	Image,
	PagingObject,
	RestrictionsReason,
} from "../shared/index.ts";
import { Market } from "../shared/markets.ts";
import { Track } from "../track/index.ts";

export interface AlbumBase {
	/**
	 * The type of the album.
	 */
	album_type: "album" | "single" | "compilation";
	/**
	 * The number of tracks in the album.
	 */
	total_tracks: number;
	/**
	 * The markets in which the album is available:
	 * ISO 3166-1 alpha-2 country codes.
	 */
	available_markets: Market[];
	/**
	 * Known external URLs for this album.
	 */
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
	release_date_precision: "year" | "month" | "day";
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: {
		/**
		 * The reason for the restriction.
		 *
		 * Albums may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content.
		 */
		reason: RestrictionsReason;
	};
	/**
	 * The object type.
	 */
	type: "album";
	/**
	 * The Spotify URI for the album.
	 */
	uri: `spotify:album:${string}`;
	/**
	 * Known external IDs for the track.
	 */
	external_ids?: ExternalIds;
	/**
	 * The copyright statements of the album.
	 */
	copyrights?: {
		/**
		 * The copyright text for this content.
		 */
		text: string;
	}[];
	/**
	 * A list of the genres the album is associated with.
	 * If not yet classified, the array is empty.
	 */
	genres?: string[];
	/**
	 * The label associated with the album.
	 */
	label?: string;
	/**
	 * The popularity of the artist.
	 * The value will be between 0 and 100, with 100 being the most popular.
	 */
	popularity?: number;
}

export interface AlbumSimplified extends AlbumBase {
	/**
	 * **The field is present when getting an artist's albums.**
	 * Compare to album_type this field represents relationship between the artist and the album.
	 */
	album_group?: "album" | "single" | "compilation" | "appears_on";
	/**
	 * The artists of the album.
	 */
	artists: ArtistSimplified[];
}

export interface Album extends AlbumBase {
	/**
	 * The artists of the album.
	 */
	artists: Artist[];
	/**
	 * The tracks of the album.
	 */
	tracks: PagingObject<Track>;
}
