import { expect, it } from "vitest";
import { ChunkPaginator, Paginator } from "./paginator";
import { client } from "../test_env";
import { getPlaylistTracks } from "./endpoints";

it("createPaginator", async () => {
  const tracks = new ChunkPaginator((opts) =>
    getPlaylistTracks(client, "6LPdVFowaGmmHu3nb20Mg3", opts)
  ).iter();

  const {} = await tracks.next();
});
