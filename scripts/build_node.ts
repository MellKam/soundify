import { build, emptyDir } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./dist/node");

await build({
	entryPoints: ["./auth/mod.ts"],
	outDir: "./dist/node",
	test: false,
	shims: {
		undici: false,
		custom: [
			{
				globalNames: [],
				typesPackage: {
					name: "@types/node",
					version: "latest",
				},
				package: { name: "@types/node", version: "latest" },
			},
		],
	},
	typeCheck: false,
	packageManager: "pnpm",
	postBuild: async () => {
		await Deno.copyFile("./LICENSE", "./dist/node/LICENSE");
	},
	compilerOptions: {
		target: "Latest",
	},
	mappings: {
		"./auth/platform/platform.deno.ts": "./auth/platform/platform.node.ts",
	},
	package: {
		name: "@soundify/node",
		version: Deno.args[0],
		license: "MIT",
	},
});
