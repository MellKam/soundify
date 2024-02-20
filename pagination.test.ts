import { CursorPageIterator, PageIterator } from "./pagination.ts";
import { assertEquals } from "std/assert/mod.ts";

type MockArtist = {
	id: string;
	type: "artist";
	name: string;
};
const totalMockItems = 50;
const mockArtists: MockArtist[] = Array(totalMockItems)
	.fill(0)
	.map((_, i) => ({
		id: i.toString(),
		type: "artist",
		name: "Radiohead",
	}));

Deno.test("PageIterator: asyncIterator", async () => {
	const pageIterator = new PageIterator((offset) => {
		const limit = 20;

		return Promise.resolve({
			items: mockArtists.slice(offset, offset + limit),
			limit,
			next: offset + limit < totalMockItems ? "http://example.com" : null,
			total: totalMockItems,
		});
	});

	const iter1 = pageIterator[Symbol.asyncIterator]();

	for (let i = 0; i < totalMockItems; i++) {
		const result = await iter1.next();
		assertEquals(result, {
			done: false,
			value: mockArtists[i],
		});
	}
	assertEquals(await iter1.next(), {
		done: true,
		value: null,
	});

	const iter2 = pageIterator[Symbol.asyncIterator](-totalMockItems);

	for (let i = 0; i < totalMockItems; i++) {
		const result = await iter2.next();
		assertEquals(result, {
			done: false,
			value: mockArtists[i],
		});
	}
	assertEquals(await iter2.next(), {
		done: true,
		value: null,
	});
});

Deno.test("PageIterator: collect", async () => {
	const pageIterator = new PageIterator((offset) => {
		const limit = 20;

		return Promise.resolve({
			href: "#",
			items: mockArtists.slice(offset, offset + limit),
			offset,
			limit,
			next: offset + limit < totalMockItems ? "http://example.com" : null,
			previous: offset > 0 ? "http://example.com" : null,
			total: totalMockItems,
		});
	});

	const items = await pageIterator.collect();
	assertEquals(items, mockArtists);

	const items2 = await pageIterator.collect(10);
	assertEquals(items2, mockArtists.slice(0, 10));
});

Deno.test("CursorPageIterator: asyncIterator", async () => {
	const cursorPageIterator = new CursorPageIterator((opts) => {
		const limit = 20;

		if (opts.after === undefined) {
			return Promise.resolve({
				items: mockArtists.slice(0, limit),
				next: limit < totalMockItems ? "http://example.com" : null,
				cursors: {
					after: mockArtists.at(limit - 1)?.id,
				},
			});
		}

		const afterArtistIndex = mockArtists.findIndex((artist) =>
			artist.id === opts.after
		);
		if (afterArtistIndex === -1) {
			throw new Error("Invalid cursor");
		}

		return Promise.resolve({
			items: mockArtists.slice(
				afterArtistIndex + 1,
				afterArtistIndex + 1 + limit,
			),
			next: afterArtistIndex + limit < totalMockItems
				? "http://example.com"
				: null,
			cursors: {
				after: mockArtists.at(afterArtistIndex + limit)?.id,
			},
		});
	});

	const iter = cursorPageIterator[Symbol.asyncIterator]();

	for (let i = 0; i < totalMockItems; i++) {
		const result = await iter.next();
		assertEquals(result, {
			done: false,
			value: mockArtists[i],
		});
	}
	assertEquals(await iter.next(), {
		done: true,
		value: null,
	});
});

Deno.test("CursorPageIterator: asyncIterator backwards", async () => {
	const initialBefore = 30;
	const cursorPageIterator = new CursorPageIterator((opts) => {
		const limit = 20;

		const beforeArtistIndex = mockArtists.findIndex((artist) =>
			artist.id === opts.before
		);
		if (beforeArtistIndex === -1) {
			throw new Error("Invalid cursor");
		}

		const lastIndex = beforeArtistIndex - limit - 1;
		const hasPreviousPage = !(lastIndex < 0);

		return Promise.resolve({
			items: mockArtists.slice(
				hasPreviousPage ? lastIndex : 0,
				beforeArtistIndex,
			),
			next: hasPreviousPage ? "http://example.com" : null,
			cursors: {
				before: hasPreviousPage ? mockArtists.at(lastIndex)?.id : undefined,
			},
		});
	}, { direction: "backward", initialBefore: initialBefore.toString() });

	const iter = cursorPageIterator[Symbol.asyncIterator]();

	for (let i = initialBefore - 1; i >= 0; i--) {
		const result = await iter.next();
		assertEquals(result, {
			done: false,
			value: mockArtists[i],
		});
	}
	assertEquals(await iter.next(), {
		done: true,
		value: null,
	});
});
