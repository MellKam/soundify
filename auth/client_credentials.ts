import { API_TOKEN_URL } from "./consts.ts";
import { getBasicAuthHeader } from "./helpers.ts";
import { AccessResponse, IAuthProvider } from "./types.ts";

export const getAccessToken = async (opts: {
	client_id: string;
	client_secret: string;
}) => {
	const basicAuthHeader = getBasicAuthHeader(
		opts.client_id,
		opts.client_secret,
	);
	const res = await fetch(API_TOKEN_URL, {
		method: "POST",
		headers: {
			"Authorization": basicAuthHeader,
			"Content-Type": "application/x-www-form-urlencoded",
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
	#access_token: string | null = null;

	constructor(
		private readonly opts: {
			client_id: string;
			client_secret: string;
		},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || this.#access_token === null) {
			const data = await getAccessToken(this.opts);
			this.#access_token = data.access_token;
		}

		return this.#access_token;
	}
}
