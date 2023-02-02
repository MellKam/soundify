import { API_PREFIX } from "./consts.ts";
import { SpotifyError, SpotifyRawError } from "./errors.ts";

export const spotifyFetch = async <
	// deno-lint-ignore no-explicit-any
	Response extends Record<string, any>,
>(
	baseURL: string | URL,
	{ body, query, headers, accessToken, method }: {
		// deno-lint-ignore no-explicit-any
		body?: Record<string, any>;
		query?: Record<string, string | number | boolean | undefined>;
		headers?: HeadersInit;
		accessToken: string;
		method?: "GET" | "POST" | "PUT" | "DELETE";
	},
) => {
	const url = new URL(API_PREFIX + baseURL);
	if (query) {
		Object.keys(query).forEach((key) => {
			const value = query[key];
			if (typeof value !== "undefined") {
				url.searchParams.set(key, value.toString());
			}
		});
	}

	const res = await fetch(url, {
		method,
		headers: {
			...headers,
			"Authorization": accessToken,
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const data = await res.json() as SpotifyRawError;
		throw new SpotifyError(data.error.message, data.error.status);
	}

	return await res.json() as Response;
};
