import { HTTPClient } from "api/client.ts";
import { Market } from "api/market/market.types.ts";

/**
 * Get the list of markets where Spotify is available.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableMarkets = async (client: HTTPClient) => {
	return (await client.fetch<{ markets: Market[] }>("/markets", "json"))
		.markets;
};
