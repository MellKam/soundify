import { emit } from "https://deno.land/x/emit@0.15.0/mod.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.4.1/mod.ts";
import {
	fromFileUrl,
	join,
	relative,
} from "https://deno.land/std@0.177.0/path/mod.ts";

const cache = createCache();

const files = await emit("./mod.ts", {
	load: (specifier) => {
		if (specifier.endsWith(".deno.ts")) {
			const baseLength = specifier.length - ".deno.ts".length;
			specifier = specifier.substring(0, baseLength) + ".web.ts";
		}
		return cache.load(specifier);
	},
});

const cwd = Deno.cwd();
await Promise.all(
	Object.keys(files).map(async (fileURL) => {
		const relativePath = relative(cwd, fromFileUrl(fileURL)).replace(
			".ts",
			".js",
		);

		await Deno.writeTextFile(
			join(cwd, "dist", "web", relativePath),
			files[fileURL].replace(/\/\/# sourceMappingURL=.*/, ""),
		);
	}),
);

// console.log("Done.");
