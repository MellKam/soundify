import { client } from "../test_env.ts";
import { getAvailableGenres } from "../mod.ts";

Deno.test("Get genres", async () => {
	const genres = await getAvailableGenres(client);
	console.log("Genres length:", genres.length);
});
