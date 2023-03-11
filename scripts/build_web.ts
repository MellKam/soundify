import { build, emptyDir } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./dist/web");

await build({
	entryPoints: ["./auth/mod.ts"],
	outDir: "./dist/web",
	test: false,
	shims: {},
	typeCheck: false,
	packageManager: "pnpm",
	scriptModule: false,
	postBuild: async () => {
		await Deno.copyFile("./LICENSE", "./dist/node/LICENSE");
	},
	compilerOptions: {
		target: "Latest",
	},
	mappings: {
		"./auth/platform/platform.deno.ts": "./auth/platform/platform.web.ts",
	},
	package: {
		name: "@soundify/web",
		version: Deno.args[0],
		license: "MIT",
	},
});
