import { QueryParams } from "../../utils.ts";

export interface PagingObject<T> {
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
	items: T[];
}

export interface CursorPagingObject<T> {
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
	items: T[];
}

export interface PagingOptions extends QueryParams {
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
}
