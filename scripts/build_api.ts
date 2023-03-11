import { build, emptyDir } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./dist/api");

await build({
	entryPoints: ["./api/mod.ts"],
	outDir: "./dist/api",
	test: false,
	shims: {},
	typeCheck: false,
	packageManager: "pnpm",
	postBuild: async () => {
		await Deno.copyFile("./LICENSE", "./dist/node/LICENSE");
	},
	compilerOptions: {
		target: "Latest",
	},
	scriptModule: false,
	package: {
		name: "@soundify/api",
		version: Deno.args[0],
		license: "MIT",
	},
});
