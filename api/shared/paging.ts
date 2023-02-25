import { QueryParams } from "../../utils.ts";

export interface PagingObject<T> {
	href: string;
	items: T[];
	limit: number;
	next?: string;
	offset: number;
	previous?: string;
	total: number;
}

export interface CursorPagingObject<T> {
	href: string;
	items: T[];
	limit: number;
	next: string;
	cursors: { after: string; before: string };
	total: number;
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
