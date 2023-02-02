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

export interface PagingOptions extends Record<string, number | undefined> {
	/**
	 * The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
	 */
	limit?: number;
	/**
	 * The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.
	 */
	offset?: number;
}
