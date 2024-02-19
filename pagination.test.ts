import { PageIterator } from "./pagination.ts";
import { assertEquals } from "std/assert/mod.ts";

type MockArtist = {
	id: number;
	type: "artist";
	name: string;
};
const totalMockItems = 50;
const mockArtists: MockArtist[] = Array(totalMockItems).fill(0).map((
	_,
	i,
) => ({
	id: i,
	type: "artist",
	name: "Radiohead",
}));

Deno.test("PageIterator: asyncIterator", async () => {
	const pageIterator = new PageIterator((opts) => {
		const limit = opts.limit || 20;
		const offset = opts.offset || 0;

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

	const iter = pageIterator.asyncIterator();

	for (let i = 0; i < totalMockItems; i++) {
		assertEquals(await iter.next(), { done: false, value: mockArtists[i] });
	}
	assertEquals(await iter.next(), {
		done: true,
		value: null,
	});
});

Deno.test("PageIterator: collect", async () => {
	const pageIterator = new PageIterator((opts) => {
		const limit = opts.limit || 20;
		const offset = opts.offset || 0;

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
});
