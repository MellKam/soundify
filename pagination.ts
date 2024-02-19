import type { Prettify } from "./shared.ts";
import type { PagingObject, PagingOptions } from "./endpoints/general.types.ts";

/**
 * Represents the possible directions a paginator can take, where the values of "next" and "prev" indicate whether the iterator is navigating forward or backward.
 */
type PaginatorDirection = "next" | "prev";

type NextPageOptions = {
	limit?: number;
	setOffset?: (offset: number) => number;
};

type PageIterOptions = Prettify<
	PagingOptions & {
		direction?: PaginatorDirection;
	}
>;

const DEFAULTS: Required<PageIterOptions> = {
	direction: "next",
	limit: 20,
	offset: 0,
};

export class ChunkIterator<TItem> {
	private defaults: Required<PageIterOptions>;

	constructor(
		private fetcher: (opts: PagingOptions) => Promise<PagingObject<TItem>>,
		defaults: PageIterOptions = {},
	) {
		this.defaults = { ...DEFAULTS, ...defaults };
	}

	asyncIterator(): AsyncIterator<
		TItem[],
		TItem[],
		NextPageOptions | undefined
	> {
		return this[Symbol.asyncIterator]();
	}

	[Symbol.asyncIterator](): AsyncIterator<
		TItem[],
		TItem[],
		NextPageOptions | undefined
	> {
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
			},
		};
	}
}

export class PageIterator<TItem> {
	private defaults: Required<PageIterOptions>;

	constructor(
		private fetcher: (opts: PagingOptions) => Promise<PagingObject<TItem>>,
		defaults: PageIterOptions = {},
	) {
		this.defaults = { ...DEFAULTS, ...defaults };
	}

	asyncIterator(): AsyncGenerator<TItem, TItem, unknown> {
		return this[Symbol.asyncIterator]();
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<TItem, TItem> {
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

	async collect(): Promise<TItem[]> {
		const items: TItem[] = [];
		for await (const item of this) {
			items.push(item);
		}
		return items;
	}
}
