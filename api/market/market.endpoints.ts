import { HTTPClient } from "../../client.ts";
import { Market } from "./market.types.ts";

/**
 * Get the list of markets where Spotify is available.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableMarkets = async (client: HTTPClient) => {
	return (await client.fetch<{ markets: Market[] }>("/markets", "json"))
		.markets;
};
