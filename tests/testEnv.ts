import {
	cleanEnv,
	makeValidator,
} from "https://deno.land/x/envalid@0.1.2/mod.ts";

import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

export interface TestEnv extends Record<string, string> {
	SPOTIFY_CLIENT_ID: string;
	SPOTIFY_CLIENT_SECRET: string;
	SPOTIFY_REFRESH_TOKEN: string;
}

export const getTestEnv = () => {
	const rawEnv = config({
		safe: true,
		path: "./.env.test.local",
	}) as Partial<TestEnv>;

	Object.keys(rawEnv).forEach((key) => {
		const value = rawEnv[key];
		if (!value) {
			const shellEnv = Deno.env.get(key);
			if (shellEnv) rawEnv[key] = shellEnv;
		}
	});

	const nonEmptyStr = makeValidator((x) => {
		if (x.length === 0) {
			throw new Error("Expected non-empty string");
		}
		return x;
	});

	return cleanEnv<TestEnv>(
		rawEnv,
		{
			SPOTIFY_CLIENT_ID: nonEmptyStr(),
			SPOTIFY_CLIENT_SECRET: nonEmptyStr(),
			SPOTIFY_REFRESH_TOKEN: nonEmptyStr(),
		},
	);
};
