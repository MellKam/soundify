import {
	cleanEnv,
	makeValidator,
} from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { AuthCode } from "auth/mod.ts";
import { SpotifyClient } from "api/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

interface TestEnv extends Record<string, string> {
	SPOTIFY_CLIENT_ID: string;
	SPOTIFY_CLIENT_SECRET: string;
	SPOTIFY_REFRESH_TOKEN: string;
}

const getTestEnv = () => {
	const rawEnv = config({
		safe: true,
		path: "./.env.test",
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

const env = getTestEnv();

const spotifyCredentials = {
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
	refresh_token: env.SPOTIFY_REFRESH_TOKEN,
};
const { access_token } = await AuthCode.refresh(spotifyCredentials);

export const client = new SpotifyClient(
	new AuthCode.AuthProvider({
		...spotifyCredentials,
		access_token,
	}),
);
