import { JSONObject } from "../shared";
import { PagingObject, PagingOptions } from "./general.types";

type PaginatorDirection = "next" | "prev";

type NextPageOpts = {
  limit?: number;
  setOffset?: (offset: number) => number;
};

type PaginatorOpts = PagingOptions & {
  direction?: PaginatorDirection;
};

const DEFAULTS: Required<PaginatorOpts> = {
  direction: "next",
  limit: 20,
  offset: 0
};

// const createChunkIterator = (
//   private fetcher: (opts: PagingOptions) => Promise<PagingObject<T>>,
//   defaults: PaginatorOpts = {}
// ) => {};

export class ChunkPaginator<T extends JSONObject> {
  private defaults!: Required<PaginatorOpts>;

  constructor(
    private fetcher: (opts: PagingOptions) => Promise<PagingObject<T>>,
    defaults: PaginatorOpts = {}
  ) {
    Object.keys(DEFAULTS).forEach((key) => {
      if (!defaults[key]) defaults[key] = DEFAULTS[key];
    });
    this.defaults = defaults as Required<PaginatorOpts>;
  }

  [Symbol.asyncIterator](): AsyncIterator<T[], T[], NextPageOpts | undefined> {
    let done = false;
    let offset = this.defaults.offset;
    let limit = this.defaults.limit;
    let direction = this.defaults.direction;

    return {
      next: async (opts = {}) => {
        if (done) return { done, value: [] };
        limit = opts.limit ? opts.limit : this.defaults.limit;
        offset = opts.setOffset ? opts.setOffset(offset) : offset;

        const chunk = await this.fetcher({ limit, offset });

        if (
          (direction === "next" && !chunk.next) ||
          (direction === "prev" && !chunk.previous)
        ) {
          done = true;
          return { value: chunk.items, done: false };
        }

        offset = direction === "next" ? offset + limit : offset - limit;
        return { value: chunk.items, done };
      }
    };
  }
}

export class SignlePaginator<T extends JSONObject> {
  private defaults!: Required<PaginatorOpts>;

  constructor(
    private fetcher: (opts: PagingOptions) => Promise<PagingObject<T>>,
    defaults: PaginatorOpts = {}
  ) {
    Object.keys(DEFAULTS).forEach((key) => {
      if (!defaults[key]) defaults[key] = DEFAULTS[key];
    });
    this.defaults = defaults as Required<PaginatorOpts>;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, T> {
    let offset = this.defaults.offset;
    let limit = this.defaults.limit;
    let direction = this.defaults.direction;

    while (true) {
      const chunk = await this.fetcher({ limit, offset });

      if (
        (direction === "next" && !chunk.next) ||
        (direction === "prev" && !chunk.previous)
      ) {
        const last = chunk.items.pop()!;
        for (const item of chunk.items) yield item;

        return last;
      }

      for (const item of chunk.items) yield item;

      offset = direction === "next" ? offset + limit : offset - limit;
    }
  }
}
