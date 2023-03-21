import { assert } from "https://deno.land/std@0.180.0/testing/asserts.ts";
import { toQueryString } from "shared/mod.ts";

Deno.test("Create URLSearchParams from object", () => {
	const queryString = toQueryString({
		a: ["1", "2", "3"],
		b: true,
		c: 5,
		d: "abc",
		e: undefined,
	});

	assert(queryString === "a=1%2C2%2C3&b=true&c=5&d=abc");
});
