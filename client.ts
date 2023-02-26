import { IAuthProvider } from "./auth/types.ts";
import { QueryParams, searchParamsFromObj, wait } from "./utils.ts";

const API_PREFIX = "https://api.spotify.com/v1";

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

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOpts {
	method?: HTTPMethod;
	body?: Record<string, unknown>;
	query?: QueryParams;
}

export interface ISpotifyClient {
	fetch(
		baseURL: string,
		returnType: "void",
		opts?: FetchOpts,
	): Promise<void>;
	fetch<
		R extends unknown,
	>(
		baseURL: string,
		returnType: "json",
		opts?: FetchOpts,
	): Promise<R>;
}

type Retry = {
	times: number;
	delay: number;
};

type SpotifyClientOpts = {
	retry5xx?: Retry;
	retry429?: Retry;
};

/**
 * A client for making requests to the Spotify API.
 */
export class SpotifyClient {
	#authProvider: IAuthProvider | string;
	#retry5xx: Retry = {
		times: 0,
		delay: 0,
	};
	#retry429: Retry = {
		times: 0,
		delay: 0,
	};

	constructor(
		/**
		 * It is recommended to pass a class that implements `IAuthProvider` to automatically update tokens. If you do not need this behavior, you can simply pass an access token.
		 */
		authProvider: IAuthProvider | string,
		opts?: SpotifyClientOpts,
	) {
		this.#authProvider = authProvider;
		if (opts) {
			if (opts.retry5xx) this.#retry5xx = opts.retry5xx;
			if (opts.retry429) this.#retry429 = opts.retry429;
		}
	}

	setAuthProvider(authProvider: IAuthProvider | string) {
		this.#authProvider = authProvider;
	}

	/**
	 * Sends an HTTP request to the Spotify API.
	 * @param baseURL The base URL for the API request.
	 * @param returnType The expected return type of the API response.
	 * @param opts Optional request options, such as the request body or query parameters.
	 * @returns A promise that resolves with the response body as a JSON object, or void if returnType is "void".
	 */
	async fetch(
		baseURL: string,
		returnType: "void",
		opts?: FetchOpts,
	): Promise<void>;
	async fetch<R = unknown>(
		baseURL: string,
		returnType: "json",
		opts?: FetchOpts,
	): Promise<R>;
	async fetch<
		R extends unknown,
	>(
		baseURL: string,
		returnType: "void" | "json",
		{ body, query, method }: FetchOpts = {},
	): Promise<R | void> {
		const url = new URL(API_PREFIX + baseURL);
		if (query) {
			url.search = searchParamsFromObj(query).toString();
		}

		const serializedBody = body ? JSON.stringify(body) : undefined;

		let isTriedRefresh = false;
		let retry5xx = this.#retry5xx.times;
		let retry429 = this.#retry429.times;

		let res: Response;
		let accessToken = typeof this.#authProvider === "string"
			? this.#authProvider
			: await this.#authProvider.getAccessToken();

		while (true) {
			try {
				res = await fetch(url, {
					method,
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
						"Authorization": `Bearer ${accessToken}`,
					},
					body: serializedBody,
				});

				if (!res.ok) {
					let error: SpotifyRawError;
					try {
						error = await res.json() as SpotifyRawError;
					} catch (_) {
						throw new SpotifyError(
							"Unable to read response body(not a json value)",
							res.status,
						);
					}

					throw new SpotifyError(error.error.message, res.status);
				}
			} catch (error) {
				// it is 100% must be SpotifyError, no need to check
				const status = (error as SpotifyError).status;

				if (
					status === 401 && typeof this.#authProvider !== "string" &&
					!isTriedRefresh
				) {
					const newToken = await this.#authProvider.getAccessToken(true);
					accessToken = newToken;
					isTriedRefresh = true;
					continue;
				}

				if (status === 429 && retry429 > 0) {
					if (this.#retry429.delay !== 0) {
						await wait(this.#retry429.delay);
					}
					retry429--;
					continue;
				}

				if (status.toString().startsWith("5") && retry5xx > 0) {
					if (this.#retry5xx.delay !== 0) {
						await wait(this.#retry5xx.delay);
					}
					retry5xx--;
					continue;
				}

				throw error;
			}
			break;
		}

		if (returnType === "json") {
			return await res.json() as R;
		}
		if (res.body) await res.body.cancel();
	}
}
