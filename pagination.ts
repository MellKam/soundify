export type PageIteratorOptions = {
	/**
	 * The Spotify API does not allow you to use a negative offset, but you can do so with this property. This will be useful when, for example, you want to get the last 100 elements.
	 *
	 * Under the hood, it will first get the total number of items by fetching with an offset of `0` and then calculate the starting offset.
	 *
	 * @default 0
	 */
	initialOffset?: number;
};

/**
 * A helper class which allows you to iterate over items in a paginated API response with javascript async iterators.
 *
 * @example
 * ```ts
 * const playlistIter = new PageIterator((offset) =>
 *   getPlaylistTracks(client, "SOME_PLAYLITS_ID", { offset, limit: 50 })
 * );
 *
 * // Iterate over the playlist tracks
 * for await (const track of playlistIter) {
 *   console.log(track);
 * }
 *
 * // Collect all the tracks
 * const tracks = await playlistIter.collect();
 *
 * // Collect the last 100 tracks in playlist
 * const lastHundredTracks = new PageIterator(
 *   (offset) =>
 *     getPlaylistTracks(client, "SOME_PLAYLITS_ID", { offset, limit: 50 }),
 *   { initialOffset: -100 },
 * ).collect();
 * ```
 */
export class PageIterator<TItem> {
	private options: Required<PageIteratorOptions>;

	constructor(
		private readonly fetcher: (offset: number) => Promise<{
			limit: number;
			next: string | null;
			total: number;
			items: TItem[];
		}>,
		options: PageIteratorOptions = {},
	) {
		this.options = { initialOffset: 0, ...options };
	}

	async *[Symbol.asyncIterator](
		initialOffset?: number,
	): AsyncGenerator<TItem, null, void> {
		let offset = typeof initialOffset === "number"
			? initialOffset
			: this.options.initialOffset;

		if (offset < 0) {
			const page = await this.fetcher(0);
			if (page.total === 0) {
				return null;
			}
			offset = page.total + offset;
		}

		while (true) {
			const page = await this.fetcher(offset);

			for (let i = 0; i < page.items.length; i++) {
				yield page.items[i]!;
			}

			if (!page.next) {
				return null;
			}

			offset = offset + page.limit;
		}
	}

	/**
	 * @param limit The maximum number of items to collect. By default it set to `Infinity`, which means it will collect all items.
	 */
	async collect(limit = Infinity): Promise<TItem[]> {
		if (limit < 0) {
			throw new RangeError(
				`The limit must be a positive number, got ${limit}`,
			);
		}
		const items: TItem[] = [];
		for await (const item of this) {
			items.push(item);
			if (items.length >= limit) {
				break;
			}
		}
		return items;
	}
}

type Direction = "backward" | "forward";

export type CursorPageIteratorOptions<TDirection extends Direction> =
	& {
		direction?: TDirection;
	}
	& (TDirection extends "forward" ? { initialAfter?: string }
		: { initialBefore?: string });

/**
 * A helper class which allows you to iterate over items in a cursor paginated API response with javascript async iterators.
 *
 * @example
 * ```ts
 * // get the first 100 followed artists
 * const artists = await new CursorPageIterator(
 *   opts => getFollowedArtists(client, { limit: 50, after: opts.after })
 * ).collect(100);
 * ```
 */
export class CursorPageIterator<
	TItem,
	TDirection extends "backward" | "forward" = "forward",
> {
	private options: CursorPageIteratorOptions<TDirection> & {
		direction: TDirection;
	};

	constructor(
		private readonly fetcher: (
			options: TDirection extends "forward" ? { after?: string }
				: { before?: string },
		) => Promise<{
			next: string | null;
			cursors: {
				after?: string;
				before?: string;
			} | null;
			items: TItem[];
		}>,
		options: CursorPageIteratorOptions<TDirection> = {},
	) {
		this.options = { direction: "forward", ...options } as
			& CursorPageIteratorOptions<TDirection>
			& {
				direction: TDirection;
			};
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<TItem, null, void> {
		const direction = this.options.direction;
		let cursor = direction === "forward"
			? "initialAfter" in this.options ? this.options.initialAfter : undefined
			: "initialBefore" in this.options
			? this.options.initialBefore
			: undefined;

		while (true) {
			const page = await this.fetcher(
				(direction === "forward" ? { after: cursor } : { before: cursor }) as {
					after?: string;
					before?: string;
				},
			);

			if (direction === "forward") {
				for (let i = 0; i < page.items.length; i++) {
					yield page.items[i]!;
				}
			} else {
				for (let i = page.items.length - 1; i >= 0; i--) {
					yield page.items[i]!;
				}
			}

			if (!page.next) {
				return null;
			}

			cursor = direction === "forward"
				? page.cursors?.after
				: page.cursors?.before;
		}
	}

	/**
	 * @param limit The maximum number of items to collect. By default it set to `Infinity`, which means it will collect all items.
	 */
	async collect(limit = Infinity): Promise<TItem[]> {
		if (limit < 0) {
			throw new RangeError(
				`The limit must be a positive number, got ${limit}`,
			);
		}
		const items: TItem[] = [];
		for await (const item of this) {
			items.push(item);
			if (items.length >= limit) {
				break;
			}
		}
		return items;
	}
}
