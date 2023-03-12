import { client } from "api/test_env.ts";
import { getAvailableMarkets } from "api/market/market.endpoints.ts";

Deno.test("Get markets", async () => {
	const markets = await getAvailableMarkets(client);
	console.log("Markets length:", markets.length);
});
