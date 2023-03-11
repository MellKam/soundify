const general = {
	"engines": {
		"node": ">=17.5.0",
	},
	"packageManager": "pnpm@7.29.1",
	"repository": {
		"type": "git",
		"url": "https://github.com/MellKam/soundify",
	},
	"license": "MIT",
	"author": {
		"name": "Artem Melnyk",
		"url": "https://github.com/MellKam",
	},
	"badges": [
		{
			"url": "https://img.shields.io/npm/v/soundify-web-api?color=1DB954",
			"description": "NPM version",
			"href": "https://www.npmjs.com/package/soundify-web-api",
		},
		{
			"url":
				"https://img.shields.io/github/v/tag/MellKam/soundify?color=1DB954&label=deno.land%2Fx&logo=deno",
			"href": "https://deno.land/x/soundify",
			"description": "DenoLand version",
		},
		{
			"url":
				"https://img.shields.io/github/license/MellKam/soundify?color=1DB954",
			"href": "https://github.com/MellKam/soundify/blob/main/LICENSE",
			"description": "License",
		},
		{
			"url":
				"https://img.shields.io/github/last-commit/MellKam/soundify?color=1DB954",
			"href": "https://github.com/MellKam/soundify/commits/main",
			"description": "Last commit",
		},
		{
			"url":
				"https://img.shields.io/github/actions/workflow/status/MellKam/soundify/ci.yaml?color=1DB954&label=CI&logo=github",
			"description": "GitHub CI Status",
			"href": "https://github.com/MellKam/soundify/actions",
		},
	],
};

export const node = {
	description: "Node specific package for soundify",
	...general,
};

// 	"description": "Modern Spotify webapi wrapper for Node, Deno, and browser 🎧",
// 	"homepage": "https://github.com/MellKam/soundify/readme",
/**
 * 	"keywords": [
		"spotify",
		"web",
		"api",
		"soundify",
		"wrapper",
		"client",
		"music",
	],
 */
