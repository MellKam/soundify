import { client } from "api/test_env.ts";
import { search } from "api/search/search.endpoints.ts";

Deno.test("Search for track", async () => {
	const searchResult = await search(
		client,
		{
			q: "Lost",
			artist: "Linkin Park",
		},
		"track",
		{ limit: 1 },
	);

	const track = searchResult.tracks.items[0];

	console.log(
		`Found: ${track.artists[0].name} - ${track.name}`,
	);
});
