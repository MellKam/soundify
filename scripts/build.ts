import { SpecifierMappings } from "https://deno.land/x/dnt@0.33.1/transform.ts";
import {
	build,
	emptyDir,
	EntryPoint,
} from "https://deno.land/x/dnt@0.33.1/mod.ts";

type Package = "api" | `${"web" | "node"}-auth` | "shared";
type BuildType = "all" | Package;

const getArgs = () => {
	const buildType = Deno.args.at(0) as BuildType | undefined ?? "all";

	let version = Deno.args.at(1) ?? "v0.0.0";

	const isValidVersion = /([\dvx*]+(?:[-.](?:[\dx*]+|alpha|beta))*)/gm.test(
		version,
	);
	if (!isValidVersion) {
		throw new Error(`Invalid package version format ${version}`);
	}

	version = version.replace(/^v/, "");

	return { version, buildType };
};

const { buildType, version } = getArgs();

const buildPackage = async (opts: {
	packageName: string;
	entryPoints: (string | EntryPoint)[];
	outDir: string;
	mappings?: SpecifierMappings;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	description: string;
	// deno-lint-ignore no-explicit-any
	typesVersions?: Record<string, any>;
	postBuild?: () => Promise<void> | void;
}) => {
	await emptyDir(opts.outDir);

	await build({
		importMap: "./import_map.json",
		entryPoints: opts.entryPoints,
		outDir: opts.outDir,
		test: false,
		shims: {},
		typeCheck: true,
		packageManager: "pnpm",
		postBuild: async () => {
			await Deno.copyFile("./LICENSE", opts.outDir + "LICENSE");
			if (opts.postBuild) await opts.postBuild();
		},
		mappings: opts.mappings,
		compilerOptions: {
			target: "Latest",
			lib: ["dom", "esnext", "dom.iterable"],
		},
		scriptModule: false,
		package: {
			name: opts.packageName,
			version,
			description: opts.description,
			license: "MIT",
			devDependencies: opts.devDependencies,
			dependencies: opts.dependencies,
			packageManager: "pnpm@8.1.0",
			typesVersions: opts.typesVersions,
			repository: {
				type: "git",
				url: "https://github.com/MellKam/soundify",
			},
			author: {
				name: "Artem Melnyk",
				url: "https://github.com/MellKam",
			},
			homepage: "https://github.com/MellKam/soundify/readme",
			keywords: [
				"spotify",
				"api",
				"wrapper",
				"music",
				"client",
				"soundify",
				"web",
				"js",
				"ts",
				"deno",
			],
		},
	});
};

const buildShared = async () => {
	console.log("\nBuild `@soudnfiy/shared` ...\n");

	await buildPackage({
		entryPoints: ["./shared/mod.ts"],
		outDir: "./dist/shared/",
		packageName: "@soundify/shared",
		description: "⚙️ Shared types and functions for soundify packages",
		postBuild: async () => {
			await Deno.copyFile("./shared/README.md", "./dist/shared/README.md");
		},
	});
};

const buildApi = async () => {
	console.log("\nBuild `@soudnfiy/api` ...\n");

	await buildPackage({
		entryPoints: ["./api/mod.ts"],
		outDir: "./dist/api/",
		packageName: "@soundify/api",
		mappings: {
			"shared/mod.ts": {
				name: "@soundify/shared",
				version,
			},
		},
		dependencies: {
			"@soundify/shared": "workspace:*",
		},
		description: "🎧 Modern Spotify api wrapper for Node, Deno, and browser",
		postBuild: async () => {
			await Deno.copyFile("./api/README.md", "./dist/api/README.md");
		},
	});
};

const authEntries = [
	"./auth/mod.ts",
	{
		name: "./auth-code",
		path: "./auth/auth_code.ts",
	},
	{
		name: "./pkce-auth-code",
		path: "./auth/pkce_auth_code.ts",
	},
	{
		name: "./client-credentials",
		path: "./auth/client_credentials.ts",
	},
	{
		name: "./implicit-grant",
		path: "./auth/implicit_grant.ts",
	},
];

const authTypes = {
	"*": {
		"index": ["./types/mod.d.ts"],
		"auth-code": ["./types/auth_code.d.ts"],
		"pkce-auth-code": ["./types/pkce_auth_code.d.ts"],
		"client-credentials": ["./types/client_credentials.d.ts"],
		"implicit-grant": ["./types/implicit_grant.d.ts"],
	},
};

const buildWeb = async () => {
	console.log("\nBuild `@soudnfiy/web-auth` ...\n");

	await buildPackage({
		entryPoints: authEntries,
		typesVersions: authTypes,
		outDir: "./dist/web-auth/",
		packageName: "@soundify/web-auth",
		mappings: {
			"auth/platform/platform.deno.ts": "./auth/platform/platform.web.ts",
			"shared/mod.ts": {
				name: "@soundify/shared",
				version,
			},
		},
		dependencies: {
			"@soundify/shared": "workspace:*",
		},
		description: "🔑 Spoitfy authorization for browser",
		postBuild: async () => {
			await Deno.copyFile("./auth/README.md", "./dist/web-auth/README.md");
		},
	});
};

const buildNode = async () => {
	console.log("\nBuild `@soudnfiy/node-auth` ...\n");

	await buildPackage({
		entryPoints: authEntries,
		outDir: "./dist/node-auth/",
		packageName: "@soundify/node-auth",
		devDependencies: {
			"@types/node": "latest",
		},
		typesVersions: authTypes,
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
			"@soundify/shared": "workspace:*",
		},
		description: "🔑 Spoitfy authorization for nodejs",
		postBuild: async () => {
			await Deno.copyFile("./auth/README.md", "./dist/node-auth/README.md");
		},
	});
};

switch (buildType) {
	case "all":
		await buildShared();
		await buildApi();
		await buildWeb();
		await buildNode();
		break;
	case "shared":
		await buildShared();
		break;
	case "api":
		await buildApi();
		break;
	case "node-auth":
		await buildNode();
		break;
	case "web-auth":
		await buildWeb();
		break;
	default:
		throw new Error(`Invalid argument for build type. '${buildType}'`);
}
