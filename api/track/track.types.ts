import { AlbumSimplified } from "../album/index.ts";
import { Artist } from "../artist/index.ts";
import {
	ExternalIds,
	ExternalUrls,
	Market,
	RestrictionsReason,
} from "../shared/index.ts";

export interface Track {
	/**
	 * The album on which the track appears.
	 */
	album: AlbumSimplified;
	/**
	 * The artists who performed the track.
	 */
	artists: Artist[];
	/**
	 * The markets in which the album is available:
	 * ISO 3166-1 alpha-2 country codes.
	 */
	available_markets: Market[];
	/**
	 * The disc number
	 * (usually 1 unless the album consists of more than one disc).
	 */
	disc_number: number;
	/**
	 * The track length in milliseconds.
	 */
	duration_ms: number;
	/**
	 * Whether or not the track has explicit lyrics.
	 */
	explicit: boolean;
	/**
	 * Known external IDs for the track.
	 */
	external_ids: ExternalIds;
	/**
	 * Known external URLs for this track.
	 */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the track.
	 */
	href: string;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	/**
	 * If true, the track is playable in the given market.
	 * Otherwise false.
	 */
	is_playable?: boolean;
	// TODO linked_from: {};
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: {
		reason: RestrictionsReason;
	};
	/**
	 * Name of the track.
	 */
	name: string;
	/**
	 * The popularity of the track.
	 * The value will be between 0 and 100, with 100 being the most popular.
	 */
	popularity: number;
	/**
	 * A link to a 30 second preview (MP3 format) of the track.
	 */
	preview_url: string | null;
	/**
	 * The number of the track. If an album has several discs, the track number is the number on the specified disc.
	 */
	track_number: number;
	/**
	 * The object type: "track".
	 */
	type: "track";
	/**
	 * The Spotify URI for the track.
	 */
	uri: `spotify:track:${string}`;
	/**
	 * Whether or not the track is from a local file.
	 */
	is_local: boolean;
}
