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
	/** @description The author(s) for the audiobook. */
	authors: Author[];
	/** @description A list of the countries in which the audiobook can be played, identified by their [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) code. */
	available_markets: string[];
	/** @description The copyright statements of the audiobook. */
	copyrights: Copyright[];
	/** @description A description of the audiobook. HTML tags are stripped away from this field, use `html_description` field in case HTML tags are needed. */
	description: string;
	/** @description A description of the audiobook. This field may contain HTML tags. */
	html_description: string;
	/**
	 * @description The edition of the audiobook.
	 *
	 * @example "Unabridged"
	 */
	edition: string;
	/** @description Whether or not the audiobook has explicit content (true = yes it does; false = no it does not OR unknown). */
	explicit: boolean;
	/** @description External URLs for this audiobook. */
	external_urls: ExternalUrls;
	/** @description A link to the Web API endpoint providing full details of the audiobook. */
	href: string;
	/** @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the audiobook. */
	id: string;
	/** @description The cover art for the audiobook in various sizes, widest first. */
	images: Image[];
	/** @description A list of the languages used in the audiobook, identified by their [ISO 639](https://en.wikipedia.org/wiki/ISO_639) code. */
	languages: string[];
	/** @description The media type of the audiobook. */
	media_type: string;
	/** @description The name of the audiobook. */
	name: string;
	/** @description The narrator(s) for the audiobook. */
	narrators: Narrator[];
	/** @description The publisher of the audiobook. */
	publisher: string;
	/** @description The object type. */
	type: "audiobook";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the audiobook. */
	uri: string;
	/** @description The number of chapters in this audiobook. */
	total_chapters: number;
}

export interface Audiobook extends SimplifiedAudiobook {
	/** @description The chapters of the audiobook. */
	chapters: PagingObject<SimplifiedChapter>;
}
