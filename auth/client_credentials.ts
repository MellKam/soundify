import { API_TOKEN_URL } from "./consts.ts";
import { getBasicAuthHeader } from "./helpers.ts";
import { AccessTokenWithScope, IAuthProvider } from "./types.ts";

export class AuthProvider implements IAuthProvider {
	readonly #BASIC_AUTH_HEADER: string;
	#access_token: string | null = null;

	constructor(
		private readonly config: {
			client_id: string;
			client_secret: string;
		},
	) {
		this.#BASIC_AUTH_HEADER = getBasicAuthHeader(
			this.config.client_id,
			this.config.client_secret,
		);
	}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || !this.#access_token) {
			const data = await this.refresh();
			this.#access_token = data.access_token;
		}

		return this.#access_token;
	}

	async refresh() {
		const res = await fetch(API_TOKEN_URL, {
			method: "POST",
			headers: {
				"Authorization": this.#BASIC_AUTH_HEADER,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "client_credentials",
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as AccessTokenWithScope;
	}
}
