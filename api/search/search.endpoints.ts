import { ISpotifyClient } from "../../client.ts";
import { QueryParams } from "../../utils.ts";
import { Market } from "../market/index.ts";
import { SearchType } from "./search.types.ts";

interface SearchOpts extends QueryParams {
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

export const search = async (
	client: ISpotifyClient,
	query: string,
	type: SearchType[],
	opts?: SearchOpts,
) => {
	await client.fetch("/search", "json", {
		query: {
			q: query,
			type,
			...opts,
		},
	});
};
