import { ISpotifyClient } from "../../client.ts";
import { QueryParams } from "../../utils.ts";
import { Market } from "../market/index.ts";
import { PagingObject } from "../shared.ts";
import { Category } from "./category.types.ts";

interface GetBrowseCategoriesOpts extends QueryParams {
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
 * @param client SpotifyClient instance
 * @param opts Additional option for request
 */
export const getBrowseCategories = async (
	client: ISpotifyClient,
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

interface GetBrowseCategoryOpts extends QueryParams {
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
}

/**
 * Get a single category used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client SpotifyClient instance
 * @param category_id The Spotify category ID for the category
 * @param opts Additional option for request
 */
export const getBrowseCategory = async (
	client: ISpotifyClient,
	category_id: string,
	opts?: GetBrowseCategoryOpts,
) => {
	return await client.fetch<Category>(
		`/browse/categories/${category_id}`,
		"json",
		{
			query: opts,
		},
	);
};
