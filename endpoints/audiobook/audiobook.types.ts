import type { SimplifiedChapter } from "../chapter/chapter.types.ts";
import type {
	Author,
	Copyright,
	ExternalUrls,
	Image,
	Narrator,
	PagingObject,
} from "../general.types.ts";

export interface SimplifiedAudiobook {
	/**
	 * The author(s) for the audiobook.
	 */
	authors: Author[];
	/**
	 * A list of the countries in which the audiobook can be played.
	 */
	available_markets: string[];
	/**
	 * The copyright statements of the audiobook.
	 */
	copyrights: Copyright[];
	/**
	 * The description of the audiobook without html tags.
	 */
	description: string;
	/**
	 * The description of the audiobook with html tags.
	 */
	html_description: string;
	/**
	 * The edition of the audiobook.
	 */
	edition: string;
	/**
	 * Whether or not the audiobook has explicit lyrics.
	 */
	explicit: boolean;
	/**
	 * External URLs for this audiobook.
	 */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the audiobook.
	 */
	href: string;
	/**
	 * The Spotify ID for the audiobook.
	 */
	id: string;
	/**
	 * Images of the audiobook in various sizes, widest first.
	 */
	images: Image[];
	/**
	 * A list of the languages used in the audiobook, identified by their ISO 639-1 code.
	 */
	languages: string[];
	/**
	 * The media type of the audiobook.
	 */
	media_type: string;
	/**
	 * The name of the audiobook.
	 */
	name: string;
	/**
	 * The narrator(s) for the audiobook.
	 */
	narrators: Narrator[];
	/**
	 * The publisher of the audiobook.
	 */
	publisher: string;
	type: "audiobook";
	/**
	 * The Spotify URI for the audiobook.
	 */
	uri: string;
	/**
	 * The number of chapters in this audiobook.
	 */
	total_chapters: number;
}

export interface Audiobook extends SimplifiedAudiobook {
	/**
	 * The chapters of the audiobook.
	 */
	chapters: PagingObject<SimplifiedChapter>;
}

export interface SavedAudiobook {
	/**
	 * The date and time the audiobook was saved Timestamps are returned in ISO 8601 format as Coordinated Universal Time (UTC) with a zero offset: YYYY-MM-DDTHH:MM:SSZ.
	 */
	added_at: string;
	/**
	 * Information about the audiobook.
	 */
	audiobook: SimplifiedAudiobook;
}
