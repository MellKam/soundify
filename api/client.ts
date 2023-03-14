import {
	ExpectedResponse,
	FetchOpts,
	HTTPClient,
	IAccessProvider,
	JSONObject,
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

interface SpotifyRegularError extends JSONObject {
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
 * The Spotify client will throw this error if the api response is not "ok" (status >= 400)
 */
export class SpotifyError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		options?: ErrorOptions,
	) {
		super(message, options);
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
	 * Access token or object that implements `IAccessProvider`
	 */
	#accessProvider: IAccessProvider | string;
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
		accessProvider: IAccessProvider | string,
		opts: SpotifyClientOpts = {},
	) {
		this.#accessProvider = accessProvider;
		if (opts.retry5xx) this.#retry5xx = opts.retry5xx;
		if (opts.retry429) this.#retry429 = opts.retry429;
	}

	setAccessProvider(accessor: IAccessProvider | string) {
		this.#accessProvider = accessor;
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

		let accessToken = typeof this.#accessProvider === "string"
			? this.#accessProvider
			: await this.#accessProvider.getAccessToken();

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
				res.status === 401 && typeof this.#accessProvider !== "string" &&
				!isTriedRefresh
			) {
				try {
					accessToken = await this.#accessProvider.getAccessToken(true);
					isTriedRefresh = true;
					return call();
				} catch (e) {
					throw new SpotifyError(
						(await res.json() as SpotifyRegularError).error.message,
						res.status,
						{ cause: e },
					);
				}
			}

			if (res.status === 429 && retry429) {
				if (this.#retry429.delay) await wait(this.#retry429.delay);

				retry429--;
				return call();
			}

			if (res.status.toString().startsWith("5") && retry5xx) {
				if (this.#retry5xx.delay) await wait(this.#retry5xx.delay);

				retry5xx--;
				return call();
			}

			throw new SpotifyError(
				(await res.json() as SpotifyRegularError).error.message,
				res.status,
			);
		};

		const res = await call();

		if (responseType === "json") {
			return await res.json() as R;
		}
		if (res.body) res.body.cancel();
	}
}
