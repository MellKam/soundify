import type { SimplifiedAudiobook } from "../audiobook/audiobook.types.ts";
import type {
	ExternalUrls,
	Image,
	ReleaseDatePrecision,
	ResumePoint,
} from "../general.types.ts";

export interface SimplifiedChapter {
	/**
	 * @description A URL to a 30 second preview (MP3 format) of the chapter. `null` if not available.
	 *
	 * @example "https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17"
	 */
	audio_preview_url: string | null;
	/** @description A list of the countries in which the chapter can be played, identified by their [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code. */
	available_markets?: string[];
	/**
	 * @description The number of the chapter
	 *
	 * @example 1
	 */
	chapter_number: number;
	/**
	 * @description A description of the chapter. HTML tags are stripped away from this field, use `html_description` field in case HTML tags are needed.
	 */
	description: string;
	/**
	 * @description A description of the chapter. This field may contain HTML tags.
	 */
	html_description: string;
	/**
	 * @description The chapter length in milliseconds.
	 *
	 * @example 1686230
	 */
	duration_ms: number;
	/** @description Whether or not the chapter has explicit content (true = yes it does; false = no it does not OR unknown). */
	explicit: boolean;
	/** @description External URLs for this chapter. */
	external_urls: ExternalUrls;
	/**
	 * @description A link to the Web API endpoint providing full details of the chapter.
	 *
	 * @example "https://api.spotify.com/v1/episodes/5Xt5DXGzch68nYYamXrNxZ"
	 */
	href: string;
	/**
	 * @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the chapter.
	 *
	 * @example "5Xt5DXGzch68nYYamXrNxZ"
	 */
	id: string;
	/** @description The cover art for the chapter in various sizes, widest first. */
	images: Image[];
	/** @description True if the chapter is playable in the given market. Otherwise false. */
	is_playable: boolean;
	/**
	 * @description A list of the languages used in the chapter, identified by their [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639) code.
	 *
	 * @example ["fr", "en"]
	 */
	languages: string[];
	/**
	 * @description The name of the chapter.
	 */
	name: string;
	/**
	 * @description The date the chapter was first released, for example `"1981-12-15"`. Depending on the precision, it might be shown as `"1981"` or `"1981-12"`.
	 *
	 * @example 1981-12-15
	 */
	release_date: string;
	/**
	 * @description The precision with which `release_date` value is known.
	 *
	 * @example "day"
	 */
	release_date_precision: ReleaseDatePrecision;
	/** @description The user's most recent position in the chapter. Set if the supplied access token is a user token and has the scope 'user-read-playback-position'. */
	resume_point: ResumePoint;
	/**
	 * The object type.
	 */
	type: "episode";
	/**
	 * @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the chapter.
	 *
	 * @example "spotify:episode:0zLhl3WsOCQHbe1BPTiHgr"
	 */
	uri: string;
	/** @description Included in the response when a content restriction is applied. */
	restrictions?: ChapterRestriction;
}

export type ChapterRestriction = {
	/**
	 * @description The reason for the restriction. Supported values:
	 * - `market` - The content item is not available in the given market.
	 * - `product` - The content item is not available for the user's subscription type.
	 * - `explicit` - The content item is explicit and the user's account is set to not play explicit content.
	 * - `payment_required` - Payment is required to play the content item.
	 *
	 * Additional reasons may be added in the future.
	 * **Note**: If you use this field, make sure that your application safely handles unknown values.
	 */
	reason?: "market" | "product" | "explicit" | "payment_required";
};

export interface Chapter extends SimplifiedChapter {
	audiobook: SimplifiedAudiobook;
}
