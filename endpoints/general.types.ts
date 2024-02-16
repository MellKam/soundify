export type PagingObject<TItem> = {
	/**
	 * A link to the Web API endpoint returning the full result of the request.
	 */
	href: string;
	/**
	 * The maximum number of items in the response.
	 */
	limit: number;
	/**
	 * URL to the next page of items.
	 */
	next: string | null;
	/**
	 * The offset of the items returned.
	 */
	offset: number;
	/**
	 * URL to the previous page of items
	 */
	previous: string | null;
	/**
	 * The total number of items available to return.
	 */
	total: number;
	items: TItem[];
};

export type CursorPagingObject<TItem> = {
	/**
	 * A link to the Web API endpoint returning the full result of the request.
	 */
	href: string;
	/**
	 * The maximum number of items in the response.
	 */
	limit: number;
	/**
	 * URL to the next page of items.
	 */
	next: string | null;
	/**
	 * The cursors used to find the next set of items.
	 */
	cursors: {
		/**
		 * The cursor to use as key to find the next page of items.
		 */
		after: string;
		/**
		 * The cursor to use as key to find the previous page of items.
		 */
		before: string;
	};
	/**
	 * The total number of items available to return.
	 */
	total: number;
	items: TItem[];
};

export type PagingOptions = {
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
	/**
	 * The index of the first item to return. Use with limit to get the next set of items.
	 * @default 0 (the first item)
	 */
	offset?: number;
};

/**
 * The reason for the restriction.
 *
 * "market" - The content item is not available in the given market. \
 * "product" - The content item is not available for the user's subscription type. \
 * "explicit" - The content item is explicit and the user's account is set to not play explicit content.
 */
export type RestrictionsReason = "market" | "product" | "explicit";

export type Restrictions = {
	/**
	 * The reason for the restriction.
	 *
	 * Episodes may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content.
	 */
	reason: RestrictionsReason;
};

/**
 * The precision with which `release_date` value is known.
 */
export type ReleaseDatePrecision = "year" | "month" | "day";

export type Image = {
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
};

export type ResumePoint = {
	/**
	 * Whether or not the episode has been fully played by the user.
	 */
	fully_played: boolean;
	/**
	 * The user's most recent position in the episode in milliseconds
	 */
	resume_position_ms: number;
};

export type Followers = {
	/**
	 * This will always be set to null, as the Web API does not support it at the moment.
	 */
	href: string | null;
	/**
	 * The total number of followers.
	 */
	total: number;
};

export type Author = {
	/**
	 * The name of the author.
	 */
	name: string;
};

export type Narrator = {
	/**
	 * The name of the narrator.
	 */
	name: string;
};

export type ExternalUrls = {
	spotify: string;
};

export type ExternalIds = {
	/**
	 * [International Standard Recording Code](https://en.wikipedia.org/wiki/International_Standard_Recording_Code).
	 */
	isrc?: string;
	/**
	 * [International Article Number](http://en.wikipedia.org/wiki/International_Article_Number_%28EAN%29).
	 */
	ean?: string;
	/**
	 * [Universal Product Code](http://en.wikipedia.org/wiki/Universal_Product_Code).
	 */
	upc?: string;
};

/**
 * The copyright object contains the type and the name of copyright.
 */
export type Copyright = {
	/**
	 * The copyright text for this content.
	 */
	text: string;
	/**
	 * The type of copyright: \
	 * C = the copyright \
	 * P = the sound recording (performance) copyright
	 */
	type: "C" | "P";
};
