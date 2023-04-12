import { expect, it } from "vitest";
import { ChunkPaginator } from "./paginator";
import { client } from "../test_env";
import { getPlaylistTracks } from "./endpoints";

it("createPaginator", async () => {
  // const playlistTracks = new Paginator((opts) =>
  //   getPlaylistTracks(client, "6LPdVFowaGmmHu3nb20Mg3", opts)
  // ).chunkIter();

  const chunkPaginator = new ChunkPaginator((opts) =>
    getPlaylistTracks(client, "6LPdVFowaGmmHu3nb20Mg3", opts)
  );

  for await (const chunk of chunkPaginator) {
  }

  // chunkPaginator.next({ limit: 20 });

  // await playlistTracks.next({ limit: 5 });
  // await playlistTracks.next({ limit: 2 });
});
