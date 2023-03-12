import {
	assert,
	assertArrayIncludes,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { searchParamsFromObj } from "shared/mod.ts";

Deno.test("Create URLSearchParams from object", () => {
	const searchParams = searchParamsFromObj({
		a: ["1", "2", "3"],
		b: true,
		c: 5,
		d: "abc",
		e: undefined,
	});

	assertArrayIncludes(searchParams.get("a")?.split(",")!, ["1", "2", "3"]);

	assert(searchParams.toString() === "a=1%2C2%2C3&b=true&c=5&d=abc");
});
