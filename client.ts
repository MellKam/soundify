import { IAuthProvider } from "./auth/types.ts";
import { searchParamsFromObj } from "./utils.ts";

export const API_PREFIX = "https://api.spotify.com/v1";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface SpotifyRawError {
	error: { message: string; status: number };
}

export interface ISpoitfyError extends Error {
	readonly status: number;
	readonly message: string;
}

export class SpotifyError extends Error implements ISpoitfyError {
	public readonly status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

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
	#authProvider: IAuthProvider | string;
	constructor(
		{ authProvider }: {
			authProvider: IAuthProvider | string;
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
		const url = new URL(API_PREFIX + baseURL);
		if (query) {
			url.search = searchParamsFromObj(query).toString();
		}

		const serializedBody = body ? JSON.stringify(body) : undefined;

		let authRetry = false;

		const call = async (token: string): Promise<Response> => {
			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: serializedBody,
			});

			if (!res.ok) {
				const { error: { message, status } } = await res
					.json() as SpotifyRawError;

				if (
					typeof this.#authProvider !== "string" && status === 401 && !authRetry
				) {
					const access_token = await this.#authProvider.getAccessToken(
						true,
					);
					authRetry = true;
					return await call(access_token);
				} else {
					throw new SpotifyError(message, status);
				}
			}

			return res;
		};

		const access_token = typeof this.#authProvider === "string"
			? this.#authProvider
			: await this.#authProvider.getAccessToken();

		const res = await call(access_token);

		return await res.json() as R;
	};
}
