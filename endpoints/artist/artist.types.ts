import type { ExternalUrls, Followers, Image } from "../general.types.ts";

export interface SimplifiedArtist {
	/** @description Known external URLs for this artist. */
	external_urls: ExternalUrls;
	/** @description A link to the Web API endpoint providing full details of the artist. */
	href: string;
	/** @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
	id: string;
	/** @description The name of the artist. */
	name: string;
	/** @description The object type. */
	type: "artist";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
	uri: string;
}

export interface Artist extends SimplifiedArtist {
	/** @description Information about the followers of the artist. */
	followers: Followers;
	/**
	 * @description A list of the genres the artist is associated with. If not yet classified, the array is empty.
	 *
	 * @example ["Prog rock", "Grunge"]
	 */
	genres: string[];
	/** @description Images of the artist in various sizes, widest first. */
	images: Image[];
	/** @description The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks. */
	popularity: number;
}
