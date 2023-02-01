import { API_PREFIX } from "./consts.ts";
import { SpotifyError } from "./errors.ts";

export const spotifyFetch = async <
	// deno-lint-ignore no-explicit-any
	R extends Record<string, any>,
	// deno-lint-ignore no-explicit-any
	B extends Record<string, any>,
	Q extends Record<string, string | number | boolean | undefined>,
>(
	baseURL: string | URL,
	{ body, query, accessToken }: {
		body?: B;
		query?: Q;
		accessToken: string;
	},
) => {
	const url = new URL(API_PREFIX + baseURL);
	if (query) {
		Object.keys(query).forEach((key) => {
			const value = query[key];
			if (value) {
				url.searchParams.set(key, value.toString());
			}
		});
	}

	const res = await fetch(url, {
		headers: {
			"Authorization": accessToken,
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const data = await res.json() as {
			error: { message: string; status: number };
		};
		throw new SpotifyError(data.error.message, data.error.status);
	}

	return await res.json() as R;
};
