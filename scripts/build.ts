import { SpecifierMappings } from "https://deno.land/x/dnt@0.33.0/transform.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

const version = "0.0.20";

const buildPackage = async (opts: {
	packageName: string;
	entryPoint: string;
	outDir: string;
	environment: "browser" | "node";
	mappings?: SpecifierMappings;
	dependencies?: Record<string, string>;
}) => {
	await emptyDir(opts.outDir);

	await build({
		importMap: "./import_map.json",
		entryPoints: [opts.entryPoint],
		outDir: opts.outDir,
		test: false,
		shims: {
			deno: "dev",
		},
		typeCheck: true,
		packageManager: "pnpm",
		postBuild: async () => {
			await Deno.copyFile("./LICENSE", opts.outDir + "LICENSE");
		},
		mappings: opts.mappings,
		compilerOptions: {
			target: "Latest",
			lib: ["dom", "esnext"],
		},
		scriptModule: false,
		package: {
			name: opts.packageName,
			version,
			license: "MIT",
			devDependencies: {
				"@types/node": opts.environment === "node" ? "latest" : undefined,
			},
			dependencies: opts.dependencies,
		},
	});
};

await buildPackage({
	entryPoint: "./api/mod.ts",
	outDir: "./dist/api/",
	packageName: "@soundify/api",
	environment: "browser",
});

await buildPackage({
	entryPoint: "./shared/mod.ts",
	outDir: "./dist/shared/",
	packageName: "@soundify/shared",
	environment: "browser",
});

await buildPackage({
	entryPoint: "./auth/mod.ts",
	outDir: "./dist/web/",
	packageName: "@soundify/web",
	environment: "browser",
	mappings: {
		"auth/platform/platform.deno.ts": "./auth/platform/platform.web.ts",
		"shared/mod.ts": {
			name: "@soundify/shared",
			version: Deno.args[0],
		},
	},
	dependencies: {
		"@soundify/shared": "link:../shared",
	},
});

await buildPackage({
	entryPoint: "./auth/mod.ts",
	outDir: "./dist/node/",
	packageName: "@soundify/node",
	environment: "node",
	mappings: {
		"auth/platform/platform.deno.ts": "./auth/platform/platform.node.ts",
		"node:buffer": "buffer",
		"node:crypto": "crypto",
		"shared/mod.ts": {
			name: "@soundify/shared",
			version: Deno.args[0],
		},
	},
	dependencies: {
		"@soundify/shared": "link:../shared",
	},
});
