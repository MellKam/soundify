import { IAuthProvider } from "./auth/types.ts";
import { QueryParams, searchParamsFromObj } from "./utils.ts";

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

export class SpotifyClient {
	#authProvider: IAuthProvider | string;
	constructor(
		{ authProvider }: {
			authProvider: IAuthProvider | string;
		},
	) {
		this.#authProvider = authProvider;
	}

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
	) {
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
				let error: SpotifyRawError;
				try {
					error = await res.json() as SpotifyRawError;
				} catch (_) {
					throw new SpotifyError(
						"Unable to read response body(not a json value)",
						res.status,
					);
				}

				const { error: { message } } = error;
				if (
					res.status === 401 && typeof this.#authProvider !== "string" &&
					!authRetry
				) {
					const access_token = await this.#authProvider.getAccessToken(
						true,
					);
					authRetry = true;
					return await call(access_token);
				}

				throw new SpotifyError(message, res.status);
			}

			return res;
		};

		const access_token = typeof this.#authProvider === "string"
			? this.#authProvider
			: await this.#authProvider.getAccessToken();

		const res = await call(access_token);

		if (returnType === "json") {
			return await res.json() as R;
		}
		if (res.body) await res.body.cancel();
	}
}
