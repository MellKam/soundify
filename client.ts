import type { SearchParams } from "./shared.ts";

/**
 * @see https://developer.spotify.com/documentation/web-api/concepts/api-calls#regular-error-object
 */
export type RegularErrorObject = {
	error: {
		message: string;
		status: number;
		reason?: string;
	};
};

export class SpotifyError extends Error {
	name = "SpotifyError";

	constructor(
		message: string,
		public readonly response: Response,
		public readonly body: RegularErrorObject | string | null,
		options?: ErrorOptions,
	) {
		super(message, options);
	}

	get url() {
		return this.response.url;
	}

	get status() {
		return this.response.status;
	}
}

const APP_JSON = "application/json";
const CONTENT_TYPE = "Content-Type";

const getBodyMessage = (body: RegularErrorObject | string | null) => {
	if (body === null) return null;
	if (typeof body === "string") return body;
	return (
		body.error.message + (body.error.reason ? ` (${body.error.reason})` : "")
	);
};

const createSpotifyError = async (
	response: Response,
	options?: ErrorOptions,
) => {
	let message = response.statusText
		? `${response.status} ${response.statusText}`
		: response.status.toString();

	const urlWithoutQuery = response.url.split("?")[0];
	if (urlWithoutQuery) {
		message += ` (${urlWithoutQuery})`;
	}

	let body: RegularErrorObject | string | null = null;

	if (response.body && response.type !== "opaque") {
		try {
			body = await response.text();
			const contentType = response.headers.get(CONTENT_TYPE);

			if (
				contentType &&
				(contentType === APP_JSON || contentType.split(";")[0] === APP_JSON)
			) {
				body = JSON.parse(body);
			}
		} catch (_) {
			/* Ignore errors */
		}

		const bodyMessage = getBodyMessage(body);
		if (bodyMessage) {
			message += " : " + bodyMessage;
		}
	}

	return new SpotifyError(message, response, body, options);
};

export interface FetchLikeOptions extends Omit<RequestInit, "body"> {
	query?: SearchParams;
	body?: BodyInit | null | Record<string, unknown> | unknown[];
}

type FetchLike = (
	resource: URL,
	options: FetchLikeOptions,
) => Promise<Response>;
export type Middleware = (next: FetchLike) => FetchLike;

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

export type SpotifyClinetOptions = {
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
	 * @default false
	 */
	waitForRateLimit?: boolean | ((retryAfter: number) => boolean);
	middlewares?: Middleware[];
};

export class SpotifyClient implements HTTPClient {
	private readonly baseUrl: string;

	constructor(
		private accessToken: string,
		private readonly options: SpotifyClinetOptions = {},
	) {
		this.baseUrl = options.baseUrl
			? options.baseUrl
			: "https://api.spotify.com/";
	}

	fetch(path: string, opts: FetchLikeOptions = {}) {
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
			headers.set(CONTENT_TYPE, APP_JSON);
		}

		const body = isBodyJSON
			? JSON.stringify(opts.body)
			: (opts.body as BodyInit | null | undefined);

		let isRefreshed = false;

		const wrappedFetch = (this.options.middlewares || []).reduceRight(
			(next, mw) => mw(next),
			(this.options.fetch || globalThis.fetch) as FetchLike,
		);

		const recursiveFetch = async (): Promise<Response> => {
			headers.set("Authorization", "Bearer " + this.accessToken);

			const res = await wrappedFetch(url, { ...opts, body, headers });

			if (res.ok) return res;

			if (res.status === 401 && this.options.refresher && !isRefreshed) {
				this.accessToken = await this.options.refresher();
				isRefreshed = true;
				return recursiveFetch();
			}

			if (res.status === 429) {
				// time in seconds
				const retryAfter = Number(res.headers.get("Retry-After")) || undefined;

				if (retryAfter) {
					const waitForRateLimit =
						typeof this.options.waitForRateLimit === "function"
							? this.options.waitForRateLimit(retryAfter)
							: this.options.waitForRateLimit;

					if (waitForRateLimit) {
						await new Promise((resolve) =>
							setTimeout(resolve, retryAfter * 1000)
						);
					}

					return recursiveFetch();
				}
			}

			throw await createSpotifyError(res);
		};

		return recursiveFetch();
	}
}
