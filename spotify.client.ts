import { SpotifyError, SpotifyRawError } from "./spotify.error.ts";
import { AccessTokenResponse } from "./auth/index.ts";
import { createURLWithParams } from "./utils.ts";
import { IAuthProvider } from "./auth/auth.types.ts";

export const API_PREFIX = "https://api.spotify.com/v1";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ISpotifyClient {
	fetch: <
		R extends unknown,
	>(baseURL: string, opts?: {
		method?: HTTPMethod;
		body?: Record<string, unknown>;
		query?: Record<string, string | number | boolean | undefined>;
	}) => Promise<R>;
}

export class SpotifyClient implements ISpotifyClient {
	#authProvider: IAuthProvider;
	constructor(
		{ authProvider }: {
			authProvider: IAuthProvider;
		},
	) {
		this.#authProvider = authProvider;
	}

	fetch = async <
		R extends unknown,
	>(
		baseURL: string,
		{ body, query, method }: {
			method?: HTTPMethod;
			body?: Record<string, unknown>;
			query?: Record<string, string | number | boolean | undefined>;
		} = {},
	) => {
		const accessToken = await this.#authProvider.getAccessToken();

		const url = query
			? createURLWithParams(API_PREFIX + baseURL, query)
			: new URL(API_PREFIX + baseURL);

		const serializedBody = body ? JSON.stringify(body) : undefined;

		const mergedHeaders: HeadersInit = {
			"Content-Type": "application/json",
			"Accept": "application/json",
		};

		const call = async (token: string) => {
			return await fetch(url, {
				method,
				headers: {
					...mergedHeaders,
					"Authorization": `Bearer ${token}`,
				},
				body: serializedBody,
			});
		};

		const res = await call(accessToken);

		if (!res.ok) {
			const { error } = await res.json() as SpotifyRawError;

			// if (error.status === 401) {

			// }

			throw new SpotifyError(error.message, error.status);
		}

		return await res.json() as R;
	};
}
