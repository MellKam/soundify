import { client } from "api/test_env.ts";
import { getPlaylist } from "api/playlist/playlist.endpoints.ts";

Deno.test("Get playlist by id", async () => {
	const playlist = await getPlaylist(client, "37i9dQZEVXbNG2KDcFcKOF");
	console.log("Genres length:", playlist.name);
});
