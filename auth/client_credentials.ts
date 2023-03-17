import {
	AccessResponse,
	API_TOKEN_URL,
	getBasicAuthHeader,
	SpotifyAuthError,
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
		throw new SpotifyAuthError(await res.text(), res.status);
	}

	return (await res.json()) as AccessResponse;
};

export type AuthProviderConfig = {
	client_id: string;
	client_secret: string;
};

export type AuthProviderOpts = {
	onRefresh?: (data: AccessResponse) => void | Promise<void>;
	onRefreshFailure?: (error: Error) => Promise<void> | void;
};

export class AuthProvider implements IAuthProvider {
	#accessToken: string | null = null;

	constructor(
		private readonly config: AuthProviderConfig,
		private readonly opts: AuthProviderOpts = {},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || !this.#accessToken) {
			try {
				const data = await getAccessToken(this.config);

				this.#accessToken = data.access_token;
				if (this.opts.onRefresh) await this.opts.onRefresh(data);
			} catch (error) {
				if (this.opts.onRefreshFailure) this.opts.onRefreshFailure(error);
				throw error;
			}
		}

		return this.#accessToken;
	}
}
