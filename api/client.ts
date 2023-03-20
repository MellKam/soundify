import {
	ExpectedResponse,
	FetchOpts,
	HTTPClient,
	IAuthProvider,
	JSONObject,
	JSONValue,
	objectToSearchParams,
} from "shared/mod.ts";

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

export interface SpotifyClientOpts {
	/**
	 * How many times do you want to try again until you throw the error
	 *
	 * @default 0
	 */
	retryTimesOn5xx?: number;
	/**
	 * How long in miliseconds do you want to wait until the next retry
	 *
	 * @default 0
	 */
	retryDelayOn5xx?: number;
	/**
	 * If it is set to true, it would refetch the same request after a paticular time interval sent by the spotify api in the headers `Retry-After` so you cannot face any obstacles.
	 * Otherwise, it will throw an error.
	 *
	 * @default false
	 */
	retryOnRateLimit?: boolean;
}

/**
 * A client for making requests to the Spotify API.
 */
export class SpotifyClient implements HTTPClient {
	constructor(
		/**
		 * It is recommended to pass a class that implements `IAuthProvider`
		 * to automatically update tokens. If you do not need this behavior,
		 * you can simply pass an access token.
		 */
		private authProvider: IAuthProvider | string,
		private readonly opts: SpotifyClientOpts = {
			retryOnRateLimit: false,
			retryDelayOn5xx: 0,
			retryTimesOn5xx: 0,
		},
	) {}

	/**
	 * Method that changes the existing authProvider to the specified one
	 */
	setAuthProvider(authProvider: IAuthProvider | string) {
		this.authProvider = authProvider;
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
		{ body, query, method, headers }: FetchOpts = {},
	): Promise<R | void> {
		const url = new URL("https://api.spotify.com/v1" + baseURL);
		if (query) {
			url.search = objectToSearchParams(query).toString();
		}
		const serializedBody = body ? JSON.stringify(body) : undefined;
		const mergedHeaders = new Headers({
			"Content-Type": "application/json",
			"Accept": "application/json",
			...headers,
		});

		let isTriedRefreshToken = false;
		let retryTimesOn5xx = this.opts.retryTimesOn5xx;

		let accessToken = typeof this.authProvider === "string"
			? this.authProvider
			: await this.authProvider.getAccessToken();

		const call = async (): Promise<Response> => {
			mergedHeaders.set("Authorization", "Bearer " + accessToken);
			const res = await fetch(url, {
				method,
				headers: mergedHeaders,
				body: serializedBody,
			});

			if (res.ok) return res;

			if (
				res.status === 401 && typeof this.authProvider !== "string" &&
				!isTriedRefreshToken
			) {
				try {
					accessToken = await this.authProvider.getAccessToken(true);
					isTriedRefreshToken = true;
					return call();
				} catch (e) {
					throw new SpotifyError(
						(await res.json() as SpotifyRegularError).error.message,
						res.status,
						{ cause: e },
					);
				}
			}

			if (res.status === 429 && this.opts.retryOnRateLimit) {
				// time in seconds
				const retryAfter = Number(res.headers.get("Retry-After"));

				if (retryAfter) {
					await new Promise((r) => setTimeout(r, retryAfter * 1000));
					return call();
				}
			}

			if (res.status.toString().startsWith("5") && retryTimesOn5xx) {
				if (this.opts.retryDelayOn5xx) {
					await new Promise((r) => setTimeout(r, this.opts.retryDelayOn5xx));
				}

				retryTimesOn5xx--;
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
