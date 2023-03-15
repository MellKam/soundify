import {
	AccessResponse,
	API_TOKEN_URL,
	getBasicAuthHeader,
	URL_ENCODED,
} from "auth/general.ts";
import { IAuthProvider } from "shared/mod.ts";

export const getAccessToken = async (opts: {
	client_id: string;
	client_secret: string;
}) => {
	const res = await fetch(API_TOKEN_URL, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(
				opts.client_id,
				opts.client_secret,
			),
			"Content-Type": URL_ENCODED,
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
		}),
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return (await res.json()) as AccessResponse;
};

export class AuthProvider implements IAuthProvider {
	#accessToken: string | null = null;

	constructor(
		private readonly config: {
			readonly client_id: string;
			readonly client_secret: string;
		},
		private readonly opts: {
			readonly onRefresh?: (data: AccessResponse) => void | Promise<void>;
			readonly onRefreshFailure?: (error: unknown) => Promise<void> | void;
		} = {},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || this.#accessToken === null) {
			try {
				const data = await getAccessToken(this.config);

				this.#accessToken = data.access_token;
				if (this.opts.onRefresh) await this.opts.onRefresh(data);
			} catch (error) {
				if (this.opts.onRefreshFailure) this.opts.onRefreshFailure(error);
				throw new Error("Failed to refresh token", { cause: error });
			}
		}

		return this.#accessToken;
	}
}
