type SearchParam =
	| string
	| number
	| boolean
	| string[]
	| number[]
	| boolean[]
	| undefined;
type SearchParams = Record<string, SearchParam>;

/**
 * @see https://developer.spotify.com/documentation/web-api/concepts/api-calls#regular-error-object
 */
export interface RegularErrorObject {
	error: {
		message: string;
		status: number;
		reason?: string;
	};
}

const isRegularErrorObject = (
	obj: unknown,
): obj is RegularErrorObject => {
	if (typeof obj !== "object" || obj === null) return false;
	const error = (obj as RegularErrorObject).error;
	if (typeof error !== "object" || error === null) return false;
	return (
		typeof error.message === "string" &&
		typeof error.status === "number" &&
		(error.reason === undefined || typeof error.reason === "string")
	);
};

export class SpotifyError extends Error {
	name = "SpotifyError";

	constructor(
		message: string,
		public readonly response: Response,
		public readonly body: RegularErrorObject | string,
		options?: ErrorOptions,
	) {
		super(message, options);
	}

	/**
	 * Shorthand for `error.response.status`
	 */
	get status(): number {
		return this.response.status;
	}
}

const APP_JSON = "application/json";

const getBodyMessage = (
	body: RegularErrorObject | string,
): string => {
	if (typeof body === "string") return body;
	return body.error.message +
		(body.error.reason ? ` (${body.error.reason})` : "");
};

export async function createSpotifyError(
	response: Response,
	options?: ErrorOptions,
): Promise<SpotifyError> {
	let message = response.statusText
		? `${response.status} ${response.statusText}`
		: response.status.toString();

	const urlWithoutQuery = response.url.split("?")[0];
	if (urlWithoutQuery) {
		message += ` (${urlWithoutQuery})`;
	}

	let body: RegularErrorObject | string = "";

	if (response.body && response.type !== "opaque") {
		const _body = await response.text().catch(() => null);
		if (_body) {
			try {
				const json = JSON.parse(_body);
				if (isRegularErrorObject(json)) {
					body = json;
				}
			} catch (_) {
				body = _body;
			}
		}

		const bodyMessage = getBodyMessage(body);
		if (bodyMessage) {
			message += " : " + bodyMessage;
		}
	}

	return new SpotifyError(message, response, body, options);
}

export interface FetchLikeOptions extends Omit<RequestInit, "body"> {
	query?: SearchParams;
	body?: BodyInit | null | Record<string, unknown> | unknown[];
}

interface MiddlewareOptions extends Omit<RequestInit, "headers"> {
	query?: SearchParams;
	headers: Headers;
}

type MiddlewareHandler = (
	url: URL,
	options: MiddlewareOptions,
) => Promise<Response>;
export type Middleware = (next: MiddlewareHandler) => MiddlewareHandler;

/**
 * Interface for making HTTP requests to the Spotify API.
 * All Soundify endpoint functions expect the client to implement this interface.
 * You can create a custom client by implementing this interface.
 */
export interface HTTPClient {
	fetch: (path: string, options?: FetchLikeOptions) => Promise<Response>;
}

const isPlainObject = (obj: unknown): obj is Record<PropertyKey, unknown> => {
	return (
		typeof obj === "object" &&
		obj !== null &&
		Object.prototype.toString.call(obj) === "[object Object]"
	);
};

export interface SpotifyClinetOptions {
	/**
	 * Use this option to provide a custom fetch function.
	 */
	fetch?: (input: URL, init?: RequestInit) => Promise<Response>;
	/**
	 * @default "https://api.spotify.com/"
	 */
	baseUrl?: string;
	/**
	 * @returns new access token
	 */
	refresher?: () => Promise<string>;
	/**
	 * Weather to wait for rate limit or not. \
	 * Function can be used to decide dynamically based on the `retryAfter` time in seconds.
	 *
	 * @default false
	 */
	waitForRateLimit?:
		| boolean
		| ((retryAfter: number) => boolean);
	/**
	 * @example
	 * ```ts
	 * const middleware: Middleware = (next) => (url, options) => {
	 *   options.headers.set("X-Custom-Header", "custom-value");
	 *   return next(url, options);
	 * }
	 *
	 * const client = new SpotifyClient("YOUR_ACCESS_TOKEN", {
	 *   middlewares: [middleware]
	 * });
	 * ```
	 */
	middlewares?: Middleware[];
}

const createFailedToAuthorizeError = () =>
	new Error(
		"[SpotifyClient] accessToken or refresher is required to make requests.",
	);

export class SpotifyClient implements HTTPClient {
	private readonly baseUrl: string;
	private refreshInProgress: Promise<void> | null = null;

	constructor(accessToken: string, options?: SpotifyClinetOptions);
	constructor(
		accessToken: null,
		options:
			& SpotifyClinetOptions
			& Required<Pick<SpotifyClinetOptions, "refresher">>,
	);
	constructor(
		private accessToken: string | null,
		private readonly options: SpotifyClinetOptions = {},
	) {
		if (!accessToken && !options.refresher) {
			throw createFailedToAuthorizeError();
		}
		this.baseUrl = options.baseUrl
			? options.baseUrl
			: "https://api.spotify.com/";
	}

	fetch(path: string, opts: FetchLikeOptions = {}): Promise<Response> {
		const url = new URL(path, this.baseUrl);
		if (opts.query) {
			for (const key in opts.query) {
				const value = opts.query[key];
				if (typeof value !== "undefined") {
					url.searchParams.set(key, value.toString());
				}
			}
		}
		const headers = new Headers(opts.headers);
		headers.set("Accept", APP_JSON);

		const isBodyJSON = !!opts.body &&
			(isPlainObject(opts.body) || Array.isArray(opts.body));
		if (isBodyJSON) {
			headers.set("Content-Type", APP_JSON);
		}

		const body = isBodyJSON
			? JSON.stringify(opts.body)
			: (opts.body as BodyInit | null | undefined);

		const wrappedFetch = (this.options.middlewares || []).reduceRight(
			(next, mw) => mw(next),
			(this.options.fetch || globalThis.fetch) as MiddlewareHandler,
		);

		let isRefreshed = false;

		if (!this.accessToken && !this.options.refresher) {
			throw createFailedToAuthorizeError();
		}

		const getRefreshPromise = () => {
			if (!this.options.refresher) return null;
			if (this.refreshInProgress === null) {
				this.refreshInProgress = new Promise((res, rej) => {
					this.options.refresher!()
						.then((newAccessToken) => {
							this.accessToken = newAccessToken;
							res();
						})
						.catch(rej)
						.finally(() => this.refreshInProgress = null);
				});
			}

			return this.refreshInProgress;
		};

		const recursiveFetch = async (): Promise<Response> => {
			if (!this.accessToken && !isRefreshed) {
				await getRefreshPromise();
				isRefreshed = true;
			}
			headers.set("Authorization", "Bearer " + this.accessToken);

			const res = await wrappedFetch(url, { ...opts, body, headers });
			if (res.ok) return res;

			if (res.status === 401 && this.options.refresher && !isRefreshed) {
				await getRefreshPromise();
				isRefreshed = true;
				return recursiveFetch();
			}

			if (res.status === 429) {
				// time in seconds
				const value = res.headers.get("Retry-After");
				const retryAfter = value ? parseInt(value) || undefined : undefined;

				if (retryAfter) {
					const waitForRateLimit =
						typeof this.options.waitForRateLimit === "function"
							? this.options.waitForRateLimit(retryAfter)
							: this.options.waitForRateLimit;

					if (waitForRateLimit) {
						await new Promise((resolve) =>
							setTimeout(resolve, retryAfter * 1000)
						);
						return recursiveFetch();
					}
				}
			}

			throw await createSpotifyError(res);
		};

		return recursiveFetch();
	}
}
