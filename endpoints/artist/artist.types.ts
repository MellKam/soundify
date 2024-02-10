import type { ExternalUrls, Followers, Image } from "../general.types.ts";

export interface SimplifiedArtist {
	/**
	 * Known external URLs for this artist.
	 */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the artist.
	 */
	href: string;
	/**
	 * The Spotify ID for the artist.
	 */
	id: string;
	/**
	 * The name of the artist.
	 */
	name: string;
	/**
	 * The object type.
	 */
	type: "artist";
	/**
	 * The Spotify URI for the artist.
	 */
	uri: string;
}

export interface Artist extends SimplifiedArtist {
	/**
	 * Information about the followers of the artist.
	 */
	followers: Followers;
	/**
	 * A list of the genres the artist is associated with.
	 * If not yet classified, the array is empty.
	 */
	genres: string[];
	/**
	 * Images of the artist in various sizes, widest first.
	 */
	images: Image[];
	/**
	 * The popularity of the artist.
	 * The value will be between 0 and 100, with 100 being the most popular.
	 * The artist's popularity is calculated from the popularity of all the artist's tracks.
	 */
	popularity: number;
}
