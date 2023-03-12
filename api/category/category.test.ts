import { client } from "api/test_env.ts";
import {
	getBrowseCategories,
	getBrowseCategory,
} from "api/category/category.endpoints.ts";
import { assert } from "https://deno.land/std@0.178.0/testing/asserts.ts";

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
