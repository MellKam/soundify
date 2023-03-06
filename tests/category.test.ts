import { getTestEnv } from "./testEnv.ts";
import { AuthCode, SpotifyClient } from "../mod.ts";
import { getBrowseCategories, getBrowseCategory } from "../api/index.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";

const env = getTestEnv();

const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
		refresh_token: env.SPOTIFY_REFRESH_TOKEN,
	}),
);

Deno.test("Get browse categories", async () => {
	const categories = await getBrowseCategories(client, {
		limit: 5,
	});

	for (const category of categories.items) {
		console.log(`Category: ${category.name}`);
	}

	const category = await getBrowseCategory(client, categories.items[0].id);

	assert(category.id === categories.items[0].id);
});
