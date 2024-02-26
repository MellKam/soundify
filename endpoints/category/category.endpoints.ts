import type { PagingObject, PagingOptions } from "../general.types.ts";
import type { Category } from "./category.types.ts";
import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";

export type GetBrowseCategoriesOptions = Prettify<
	PagingOptions & {
		/**
		 * The desired language, consisting of an [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1) language code and an [ISO 3166-1 alpha-2 country code](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2), joined by an underscore.
		 *
		 * _**Note**: if `locale` is not supplied, or if the specified language is not available, the category strings returned will be in the Spotify default language (American English)._
		 *
		 * @example "es_MX" - meaning "Spanish (Mexico)".
		 */
		locale?: string;
	}
>;

/**
 * Get a list of categories used to tag items in Spotify
 * (on, for example, the Spotify player’s “Browse” tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getBrowseCategories(
	client: HTTPClient,
	options?: GetBrowseCategoriesOptions,
): Promise<PagingObject<Category>> {
	const res = await client.fetch("/v1/browse/categories", {
		query: options,
	});
	return (await res.json() as { categories: PagingObject<Category> })
		.categories;
}

export type GetBrowseCategoryOptions = {
	/**
	 * The desired language, consisting of an [ISO 639-1](http://en.wikipedia.org/wiki/ISO_639-1) language code and an [ISO 3166-1 alpha-2 country code](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2), joined by an underscore.
	 *
	 * _**Note**: if `locale` is not supplied, or if the specified language is not available, the category strings returned will be in the Spotify default language (American English)._
	 *
	 * @example "es_MX" - meaning "Spanish (Mexico)".
	 */
	locale?: string;
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
export async function getBrowseCategory(
	client: HTTPClient,
	categoryId: string,
	options?: GetBrowseCategoryOptions,
): Promise<Category> {
	const res = await client.fetch("/v1/browse/categories/" + categoryId, {
		query: options,
	});
	return res.json() as Promise<Category>;
}
