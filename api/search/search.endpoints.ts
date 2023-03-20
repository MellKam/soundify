import { HTTPClient, SearchParams } from "shared/mod.ts";
import { Market } from "api/market/market.types.ts";
import {
	SearchFilters,
	SearchResponse,
	SearchType,
	SearchTypeLiteral,
} from "api/search/search.types.ts";

export interface SearchOpts extends SearchParams {
	/**
	 * If `include_external=audio` is specified it signals that the client can play externally hosted audio content, and marks the content as playable in the response.
	 *
	 * By default externally hosted audio content is marked as unplayable in the response.
	 */
	include_external?: "audio";
	/**
	 * The maximum number of results to return in each item type.
	 * Minimum: 1. Maximum: 50.
	 *
	 * @default 20
	 */
	limit?: number;
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: Market;
	/**
	 * The index of the first result to return. Use with limit to get the next page of search results.
	 * Minimum 0. Maximum 1000.
	 *
	 * @default 0
	 */
	offset?: number;
}

/**
 * Get Spotify catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks that match a keyword string.
 *
 * @param client Spotify HTTPClient
 * @param query Your search query
 * @param type One or multiple item types to search across
 * @param opts Additional options for request
 */
export const search = async <T extends SearchType[] | SearchType>(
	client: HTTPClient,
	query: string | SearchFilters,
	type: T,
	opts?: SearchOpts,
): Promise<Pick<SearchResponse, SearchTypeLiteral<T>>> => {
	return await client.fetch("/search", "json", {
		query: {
			q: typeof query === "string" ? query : Object.entries(query)
				.map(([key, value]) => (key === "q" ? value : `${key}:${value}`))
				.join(" "),
			type,
			...opts,
		},
	});
};
