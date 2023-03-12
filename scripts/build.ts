import { SpecifierMappings } from "https://deno.land/x/dnt@0.33.0/transform.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.1/mod.ts";

const buildType = Deno.args[0] as
	| "local"
	| `npm:${"api" | "web" | "node" | "shared"}`
	| undefined ?? "local";

const version = Deno.args[1]?.replace(/^v/, "");

const buildPackage = async (opts: {
	packageName: string;
	entryPoint: string;
	outDir: string;
	environment: "browser" | "node";
	mappings?: SpecifierMappings;
	dependencies?: Record<string, string>;
	description: string;
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
			packageManager: "pnpm@7.29.1",
			repository: {
				type: "git",
				url: "https://github.com/MellKam/soundify",
			},
			author: {
				name: "Artem Melnyk",
				url: "https://github.com/MellKam",
			},
			homepage: "https://github.com/MellKam/soundify/readme",
		},
	});
};

const buildShared = async () => {
	console.log("\nBuild `@soudnfiy/shared` ...\n");

	await buildPackage({
		entryPoint: "./shared/mod.ts",
		outDir: "./dist/shared/",
		packageName: "@soundify/shared",
		environment: "browser",
		description: "Shared types and functions for soundify packages",
	});
};

const buildApi = async (type: "local" | "npm") => {
	console.log("\nBuild `@soudnfiy/api` ...\n");

	await buildPackage({
		entryPoint: "./api/mod.ts",
		outDir: "./dist/api/",
		packageName: "@soundify/api",
		environment: "browser",
		mappings: {
			"shared/mod.ts": {
				name: "@soundify/shared",
				version,
			},
		},
		dependencies: {
			"@soundify/shared": type === "local" ? "link:../shared" : version,
		},
		description: "Modern Spotify api wrapper for Node, Deno, and browser 🎧",
	});
};

const buildWeb = async (type: "local" | "npm") => {
	console.log("\nBuild `@soudnfiy/web` ...\n");

	await buildPackage({
		entryPoint: "./auth/mod.ts",
		outDir: "./dist/web/",
		packageName: "@soundify/web",
		environment: "browser",
		mappings: {
			"auth/platform/platform.deno.ts": "./auth/platform/platform.web.ts",
			"shared/mod.ts": {
				name: "@soundify/shared",
				version,
			},
		},
		dependencies: {
			"@soundify/shared": type === "local" ? "link:../shared" : version,
		},
		description: "Spoitfy authorization for web platform",
	});
};

const buildNode = async (type: "local" | "npm") => {
	console.log("\nBuild `@soudnfiy/node` ...\n");

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
				version,
			},
		},
		dependencies: {
			"@soundify/shared": type === "local" ? "link:../shared" : version,
		},
		description: "Spoitfy authorization for nodejs platform",
	});
};

if (buildType === "local") {
	await buildShared();
	await buildApi("local");
	await buildWeb("local");
	await buildNode("local");
	Deno.exit(0);
}

const buildMap = {
	"npm:shared": buildShared,
	"npm:api": buildApi,
	"npm:web": buildWeb,
	"npm:node": buildNode,
};

await buildMap[buildType]("npm");
