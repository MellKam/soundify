import type { HTTPClient } from "../../client.ts";

/**
 * Get the list of markets where Spotify is available.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableMarkets = async (client: HTTPClient) => {
	const res = await client.fetch("/v1/markets");
	return (await res.json() as { markets: string[] }).markets;
};
