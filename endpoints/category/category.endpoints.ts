import type { PagingObject } from "../general.types.ts";
import type { Category } from "./category.types.ts";
import type { HTTPClient } from "../../client.ts";

export type GetBrowseCategoriesOpts = {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	country?: string;
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
	/**
	 * The desired language, consisting of an ISO 639-1 language code and an ISO 3166-1 alpha-2 country code, joined by an underscore.
	 *
	 * Provide this parameter if you want the category metadata returned in a particular language.
	 *
	 * @example "es_MX" - meaning "Spanish (Mexico)".
	 */
	locale?: string;
	/**
	 * The index of the first item to return.
	 * Use with limit to get the next set of items.
	 *
	 * @default 0
	 */
	offset?: number;
};

/**
 * Get a list of categories used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getBrowseCategories = async (
	client: HTTPClient,
	options?: GetBrowseCategoriesOpts,
): Promise<PagingObject<Category>> => {
	const res = await client.fetch("/v1/browse/categories", {
		query: options,
	});
	return (await res.json() as { categories: PagingObject<Category> })
		.categories;
};

export type GetBrowseCategoryOpts = {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * Provide this parameter to ensure that the category exists for a particular country.
	 */
	country?: string;
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
};

/**
 * Get a single category used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param categoryId The Spotify category ID for the category
 * @param options Additional option for request
 */
export const getBrowseCategory = async (
	client: HTTPClient,
	categoryId: string,
	options?: GetBrowseCategoryOpts,
): Promise<Category> => {
	const res = await client.fetch("/v1/browse/categories/" + categoryId, {
		query: options,
	});
	return res.json() as Promise<Category>;
};
