import { ISpotifyClient } from "../../client.ts";
import { Market } from "./market.types.ts";

/**
 * Get the list of markets where Spotify is available.
 *
 * @param client SpotifyClient instance
 */
export const getAvailableMarkets = async (client: ISpotifyClient) => {
	return await client.fetch<{ markets: Market[] }>("/markets", "json");
};
