import {
	Accessor,
	ExpectedResponse,
	FetchOpts,
	HTTPClient,
	JSONValue,
	objectToSearchParams,
} from "shared/mod.ts";

type Retry = {
	/**
	 * How many times do you want to try again until you throw the error
	 *
	 * @default 0
	 */
	times: number;
	/**
	 * How long in miliseconds do you want to wait until the next retry
	 *
	 * @default 0
	 */
	delay: number;
};

interface SpotifyRegularError {
	error: {
		/**
		 * A short description of the cause of the error.
		 */
		message: string;
		/**
		 * The HTTP status code that is also returned in the response header.
		 */
		status: number;
	};
}

/**
 * Client will throw this error if spotify will return error
 */
export class SpotifyError extends Error {
	constructor(message: string, public readonly status: number) {
		super(message);
		this.name = "SpotifyError" + status;
	}
}

/**
 * Returns promise that will be resolved after specified delay
 * @param delay milliseconds
 */
export const wait = (delay: number) => {
	return new Promise<void>((res) => {
		setTimeout(res, delay);
	});
};

export interface SpotifyClientOpts {
	/**
	 * Retry options for errors with status code >= 500
	 */
	retry5xx?: Retry;
	/**
	 * Retry options for rate limit errors
	 */
	retry429?: Retry;
}

/**
 * A client for making requests to the Spotify API.
 */
export class SpotifyClient implements HTTPClient {
	/**
	 * Access token or object that implements `Accessor`
	 */
	#accessor: string | Accessor;
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
		 * It is recommended to pass a class that implements `Accessor`
		 * to automatically update tokens. If you do not need this behavior,
		 * you can simply pass an access token.
		 */
		accessor: Accessor | string,
		opts: SpotifyClientOpts = {},
	) {
		this.#accessor = accessor;
		if (opts.retry5xx) this.#retry5xx = opts.retry5xx;
		if (opts.retry429) this.#retry429 = opts.retry429;
	}

	setAccessor(accessor: Accessor | string) {
		this.#accessor = accessor;
	}

	fetch(
		baseURL: string,
		responseType: "void",
		opts?: FetchOpts,
	): Promise<void>;
	fetch<
		R extends JSONValue = JSONValue,
	>(
		baseURL: string,
		responseType: "json",
		opts?: FetchOpts,
	): Promise<R>;
	async fetch<
		R extends JSONValue = JSONValue,
	>(
		baseURL: string,
		responseType: ExpectedResponse,
		{ body, query, method }: FetchOpts = {},
	): Promise<R | void> {
		const url = new URL("https://api.spotify.com/v1" + baseURL);
		if (query) {
			url.search = objectToSearchParams(query).toString();
		}
		const serializedBody = body ? JSON.stringify(body) : undefined;

		let isTriedRefresh = false;
		let retry5xx = this.#retry5xx.times;
		let retry429 = this.#retry429.times;

		let accessToken = typeof this.#accessor === "string"
			? this.#accessor
			: await this.#accessor.getAccessToken();

		const call = async (): Promise<Response> => {
			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": "Bearer " + accessToken,
				},
				body: serializedBody,
			});

			if (res.ok) return res;

			if (
				res.status === 401 && typeof this.#accessor !== "string" &&
				!isTriedRefresh
			) {
				const newToken = await this.#accessor.getAccessToken(true);
				accessToken = newToken;
				isTriedRefresh = true;
				return call();
			}

			if (res.status === 429 && retry429 > 0) {
				if (this.#retry429.delay !== 0) {
					await wait(this.#retry429.delay);
				}
				retry429--;
				return call();
			}

			if (res.status.toString().startsWith("5") && retry5xx > 0) {
				if (this.#retry5xx.delay !== 0) {
					await wait(this.#retry5xx.delay);
				}
				retry5xx--;
				return call();
			}

			let error: SpotifyRegularError;

			try {
				error = await res.json() as SpotifyRegularError;
			} catch (_) {
				throw new SpotifyError(
					"Unable to read response body (not a json value)",
					res.status,
				);
			}

			throw new SpotifyError(error.error.message, res.status);
		};

		const res = await call();

		if (responseType === "json") {
			return await res.json() as R;
		}
		if (res.body) await res.body.cancel();
	}
}
