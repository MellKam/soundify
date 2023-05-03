import { JSONObject } from "./shared";
import { PagingObject, PagingOptions } from "./api/general.types";

/**
 * Represents the possible directions a paginator can take, where the values of "next" and "prev" indicate whether the iterator is navigating forward or backward.
 */
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

export class ChunkPaginator<T extends JSONObject> {
  private defaults: Required<PaginatorOpts>;

  constructor(
    private fetcher: (opts: PagingOptions) => Promise<PagingObject<T>>,
    defaults: PaginatorOpts = {}
  ) {
    for (const key in DEFAULTS) {
      if (!defaults[key]) defaults[key] = DEFAULTS[key];
    }
    this.defaults = defaults as Required<PaginatorOpts>;
  }

  asyncIterator() {
    return this[Symbol.asyncIterator]();
  }

  [Symbol.asyncIterator](): AsyncIterator<T[], T[], NextPageOpts | undefined> {
    let done = false;
    let { direction, limit, offset } = this.defaults;

    return {
      next: async (opts = {}) => {
        if (done) return { done, value: [] };
        limit = opts.limit ?? this.defaults.limit;
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

export class Paginator<T extends JSONObject> {
  private defaults: Required<PaginatorOpts>;

  constructor(
    private fetcher: (opts: PagingOptions) => Promise<PagingObject<T>>,
    defaults: PaginatorOpts = {}
  ) {
    for (const key in DEFAULTS) {
      if (!defaults[key]) defaults[key] = DEFAULTS[key];
    }
    this.defaults = defaults as Required<PaginatorOpts>;
  }

  asyncIterator() {
    return this[Symbol.asyncIterator]();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T, T> {
    let { direction, limit, offset } = this.defaults;

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

  async collect() {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}
