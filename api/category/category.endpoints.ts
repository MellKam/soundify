import { SearchParams } from "shared/mod.ts";
import { PagingObject } from "api/general.types.ts";
import { Market } from "api/market/market.types.ts";
import { Category } from "api/category/category.types.ts";
import { HTTPClient } from "api/client.ts";

export interface GetBrowseCategoriesOpts extends SearchParams {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	country?: Market;
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
}

/**
 * Get a list of categories used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getBrowseCategories = async (
	client: HTTPClient,
	opts?: GetBrowseCategoriesOpts,
) => {
	return (await client.fetch<{ categories: PagingObject<Category> }>(
		"/browse/categories",
		"json",
		{
			query: opts,
		},
	)).categories;
};

export interface GetBrowseCategoryOpts extends SearchParams {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * Provide this parameter to ensure that the category exists for a particular country.
	 */
	country?: Market;
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
}

/**
 * Get a single category used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param category_id The Spotify category ID for the category
 * @param opts Additional option for request
 */
export const getBrowseCategory = async (
	client: HTTPClient,
	category_id: string,
	opts?: GetBrowseCategoryOpts,
) => {
	return await client.fetch<Category>(
		"/browse/categories/" + category_id,
		"json",
		{
			query: opts,
		},
	);
};
