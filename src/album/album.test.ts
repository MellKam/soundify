import { getAlbum } from "../mod.ts";
import { albumSchema } from "./album.schemas.ts";
import { client } from "../test_client.ts";

Deno.test("getAlbum", async () => {
	const album = await getAlbum(client, "35UJLpClj5EDrhpNIi4DFg");
	albumSchema.parse(album);
});
