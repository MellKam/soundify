export * from "./markets.ts";
export * from "./paging.ts";

/**
 * The reason for the restriction.
 *
 * "market" - The content item is not available in the given market. \
 * "product" - The content item is not available for the user's subscription type. \
 * "explicit" - The content item is explicit and the user's account is set to not play explicit content.
 */
export type RestrictionsReason = "market" | "product" | "explicit";

export interface Image {
	/**
	 * The image height in pixels.
	 */
	height: number | null;
	/**
	 * The source URL of the image.
	 */
	url: string;
	/**
	 * The image width in pixels.
	 */
	width: number | null;
}

export interface Followers {
	/**
	 * This will always be set to null, as the Web API does not support it at the moment.
	 */
	href: string | null;
	/**
	 * The total number of followers.
	 */
	total: number;
}

export interface ExternalUrls {
	spotify: string;
}

export interface ExternalIds {
	/**
	 * [International Standard Recording Code](https://en.wikipedia.org/wiki/International_Standard_Recording_Code).
	 */
	isrc: string;
	/**
	 * [International Article Number](http://en.wikipedia.org/wiki/International_Article_Number_%28EAN%29).
	 */
	ean: string;
	/**
	 * [Universal Product Code](http://en.wikipedia.org/wiki/Universal_Product_Code).
	 */
	upc: string;
}
