import {
	assert,
	assertArrayIncludes,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import {
	assertSpyCallArg,
	spy,
} from "https://deno.land/std@0.178.0/testing/mock.ts";
import { searchParamsFromObj, wait } from "../utils.ts";

Deno.test("Must wait 1000ms", async () => {
	const setTimeoutSpyier = spy(globalThis, "setTimeout");

	const start = new Date().getTime();

	await wait(1000).then(() => {
		const timePassed = new Date().getTime() - start;
		const delta = Math.abs(timePassed - 1000);

		console.log(`Waited ${timePassed}ms. Delta ${delta}ms`);
	});

	assertSpyCallArg(setTimeoutSpyier, 0, 1, 1000);

	setTimeoutSpyier.restore();
});

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
