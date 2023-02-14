import { SpotifyError, SpotifyRawError } from "./spotify.error.ts";
import { AccessTokenResponse } from "./auth/index.ts";
import { createURLWithParams } from "./utils.ts";

export const API_PREFIX = "https://api.spotify.com/v1";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ISpotifyClient {
	fetch: <
		R extends unknown,
	>(baseURL: string, opts?: {
		method?: HTTPMethod;
		body?: Record<string, unknown>;
		query?: Record<string, string | number | boolean | undefined>;
		headers?: HeadersInit;
	}) => Promise<R>;
}

export class SpotifyClient implements ISpotifyClient {
	#accessToken: string | null = null;
	#isExpired = true;
	#expireTimeoutId: ReturnType<typeof setTimeout> | null = null;
	#refresh: (() => Promise<AccessTokenResponse>) | null = null;

	constructor(
		{ refresh, access_token, expires_in }: {
			refresh?: () => Promise<AccessTokenResponse>;
			access_token?: string;
			expires_in?: number;
		},
	) {
		if (refresh) this.#refresh = refresh;
		if (access_token) {
			this.#accessToken = access_token;
			this.#isExpired = false;
		}
		if (expires_in) {
			this.#expireTimeoutId = this.#expireTokenIn(expires_in);
		}
	}

	fetch = async <
		R extends unknown,
	>(
		baseURL: string,
		{ body, query, headers, method }: {
			method?: HTTPMethod;
			body?: Record<string, unknown>;
			query?: Record<string, string | number | boolean | undefined>;
			headers?: HeadersInit;
		} = {},
	) => {
		const accessToken = await this.#getAccessToken();

		const url = query
			? createURLWithParams(API_PREFIX + baseURL, query)
			: new URL(API_PREFIX + baseURL);

		const serializedBody = body ? JSON.stringify(body) : undefined;

		const mergedHeaders: HeadersInit = {
			...headers,
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

		let res = await call(accessToken);

		if (!res.ok) {
			const { error } = await res.json() as SpotifyRawError;

			if (error.status === 401) {
				res = await this.retryOrThrow(
					call,
					new SpotifyError(error.message, error.status),
				);
			}
			if (error.status === 429) {
				res = await this.retryOrThrow(
					call,
					new SpotifyError(error.message, error.status),
					{
						interval: 500,
						times: 3,
					},
				);
			}
			if (error.status >= 500) {
				res = await this.retryOrThrow(
					call,
					new SpotifyError(error.message, error.status),
					{
						interval: 500,
						times: 3,
					},
				);
			}

			throw new SpotifyError(error.message, error.status);
		}

		return await res.json() as R;
	};

	async retryOrThrow(
		fn: (accessToken: string) => Promise<Response> | Response,
		error: Error,
		opts: {
			times?: number;
			interval?: number;
			handler?: (
				res: Response,
				retryOrThrow: (error: Error) => void,
			) => void;
		} = {},
	): Promise<Response> {
		let times = opts.times ?? 1;
		const interval = opts.interval ?? 0;

		while (true) {
			if (times === 0) {
				throw error;
			}
			const accessToken = await this.#getAccessToken();
			const res = await fn(accessToken);

			times--;

			if (opts.handler) {
				opts.handler(res, (err) => {
					if (times === 0) {
						throw err;
					}
				});
			}
			if (res.ok) {
				return res;
			}

			if (interval !== 0) await this.#wait(interval);
		}
	}

	#wait(time: number) {
		return new Promise<void>((res) => {
			setTimeout(() => res(), time);
		});
	}

	async #getAccessToken() {
		if (this.#accessToken === null || this.#isExpired) {
			if (!this.#refresh) {
				throw new Error("Invalid accessToken without ability to refresh");
			}
			try {
				const { access_token, expires_in } = await this.#refresh();
				this.#isExpired = false;
				this.#expireTimeoutId = this.#expireTokenIn(expires_in);
				this.#accessToken = access_token;
			} catch (error) {
				throw new Error(`Cannot refresh token: ${String(error)}`);
			}
		}
		return this.#accessToken;
	}

	#expireTokenIn(delay: number) {
		return setTimeout(() => this.#isExpired = true, delay);
	}

	removeExpireListener() {
		if (!this.#expireTimeoutId) {
			throw new Error("expireTimeoutId in null");
		}
		clearTimeout(this.#expireTimeoutId);
	}
}
