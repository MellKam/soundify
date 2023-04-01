import { assert } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { createSpotifyAPI } from "api/api.ts";
import * as endpoints from "api/endpoints.ts";
import { authProvider } from "api/test_env.ts";

Deno.test("SpotifyAPI creator", () => {
	const api = createSpotifyAPI(authProvider);

	for (const name in endpoints) {
		assert(typeof api[name as keyof typeof endpoints] === "function");
	}
});

Deno.test("SpotifyAPI call", async () => {
	const api = createSpotifyAPI(authProvider);

	const user = await api.getCurrentUser();
	console.log(user.display_name);
});
