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

	public readonly response: Response;
	public readonly body: RegularErrorObject | string | null;

	constructor(
		message: string,
		response: Response,
		body: RegularErrorObject | string | null,
		options?: ErrorOptions
	) {
		super(message, options);
		this.response = response;
		this.body = body;
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

const createSpotifyError = async (
	response: Response,
	options?: ErrorOptions
) => {
	let message = response.statusText
		? `${response.status} ${response.statusText} (${response.url})`
		: `${response.status} (${response.url})`;
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
	}

	const bodyMessage =
		body === null ? null : typeof body === "string" ? body : body.error.message;
	if (bodyMessage) {
		message += " : " + bodyMessage;
	}

	return new SpotifyError(message, response, body, options);
};

export type FetchOptions = {
	query?: SearchParams;
	body?: BodyInit | null | Record<string, unknown> | unknown[];
} & Omit<RequestInit, "body">;

/**
 * Interface that provides a fetch method to make HTTP requests to Spotify API.
 */
export interface HTTPClient {
	fetch(path: string, opts?: FetchOptions): Promise<Response>;
}

export const SPOTIFY_API_URL = "https://api.spotify.com/";

const isPlainObject = (obj: unknown): obj is Record<PropertyKey, unknown> => {
	return (
		typeof obj === "object" &&
		obj !== null &&
		Object.prototype.toString.call(obj) === "[object Object]"
	);
};

export type SpotifyClinetOptions = {
	baseUrl?: string;
	refresher?: () => Promise<string>;
	onRateLimit?: (retryAfter?: number) => Promise<void> | void;
	/**
	 * @default false
	 */
	waitForRateLimit?: boolean;
	/**
	 * @default 0
	 */
	retryTimesOn5xx?: number;
	/**
	 * @default 0
	 */
	retryDelayOn5xx?: number;
};

export class SpotifyClient {
	private readonly baseUrl: string;

	constructor(
		private accessToken: string,
		private readonly options: SpotifyClinetOptions = {}
	) {
		this.baseUrl = options.baseUrl ? options.baseUrl : SPOTIFY_API_URL;
	}

	fetch(path: string, opts: FetchOptions = {}) {
		const url = new URL(path, this.baseUrl);
		if (opts.query) {
			for (const key in opts.query) {
				const value = opts.query[key];
				if (typeof value !== "undefined")
					url.searchParams.set(key, value.toString());
			}
		}
		const headers = new Headers(opts.headers);
		headers.set("Accept", APP_JSON);

		const isBodyJSON =
			!!opts.body && (isPlainObject(opts.body) || Array.isArray(opts.body));
		if (isBodyJSON) {
			headers.set(CONTENT_TYPE, APP_JSON);
		}

		const body = isBodyJSON
			? JSON.stringify(opts.body)
			: (opts.body as BodyInit | null | undefined);

		let isRefreshed = false;
		let retries5xx = this.options.retryTimesOn5xx;

		const recursiveCall = async (): Promise<Response> => {
			headers.set("Authorization", "Bearer " + this.accessToken);

			const res = await fetch(url, { ...opts, body, headers });
			if (res.ok) return res;

			if (res.status === 401 && this.options.refresher && !isRefreshed) {
				this.accessToken = await this.options.refresher();
				isRefreshed = true;
				return recursiveCall();
			}

			const error = await createSpotifyError(res);

			if (res.status === 429) {
				// time in seconds
				const retryAfter = Number(res.headers.get("Retry-After")) || undefined;

				if (this.options.onRateLimit) {
					this.options.onRateLimit(retryAfter);
				}

				if (retryAfter && this.options.waitForRateLimit) {
					await new Promise((r) => setTimeout(r, retryAfter * 1000));
					return recursiveCall();
				}

				throw error;
			}

			if (res.status >= 500 && retries5xx) {
				if (this.options.retryDelayOn5xx) {
					await new Promise((r) => setTimeout(r, this.options.retryDelayOn5xx));
				}

				retries5xx--;
				return recursiveCall();
			}

			throw error;
		};

		return recursiveCall();
	}
}
