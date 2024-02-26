import type { HTTPClient } from "../../client.ts";
import { Market } from "./market.types.ts";

/**
 * Get the list of markets where Spotify is available.
 */
export async function getAvailableMarkets(
	client: HTTPClient,
): Promise<Market[]> {
	const res = await client.fetch("/v1/markets");
	return (await res.json() as { markets: Market[] }).markets;
}
