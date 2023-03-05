// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./node");

await build({
	entryPoints: ["./mod.ts"],
	outDir: "./node",
	test: false,
	shims: {
		undici: true,
	},
	typeCheck: true,
	packageManager: "pnpm",
	compilerOptions: {
		target: "Latest",
	},
	mappings: {
		"./platform/platform.deno.ts": "./platform/platform.node.ts",
	},
	package: {
		name: "soundify-web-api",
		version: Deno.args[0],
		license: "MIT",
	},
});
