import { HTTPClient } from "../client";
import { Market } from "../market/market.types";

/**
 * Get the list of markets where Spotify is available.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableMarkets = async (client: HTTPClient) => {
  return (await client.fetch<{ markets: Market[] }>("/markets", "json"))
    .markets;
};
