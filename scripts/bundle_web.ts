import * as esbuild from "https://deno.land/x/esbuild@v0.17.10/mod.js";
import { Plugin } from "https://deno.land/x/esbuild@v0.17.10/mod.d.ts";
import { resolve } from "https://deno.land/std@0.178.0/path/mod.ts";

const plugin: Plugin = {
	name: "web",
	setup(build) {
		build.onResolve({ filter: /.*deno.ts/g }, (args) => {
			return {
				path: resolve(
					args.resolveDir,
					args.path.replace(".deno.ts", ".web.ts"),
				),
			};
		});
	},
};

await esbuild.build({
	entryPoints: ["./mod.ts"],
	outfile: "./dist/web.mjs",
	format: "esm",
	platform: "browser",
	bundle: true,
	minify: true,
	target: ["es2022"],
	plugins: [plugin],
});

esbuild.stop();
