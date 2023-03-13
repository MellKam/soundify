import { API_TOKEN_URL, URL_ENCODED } from "auth/consts.ts";
import { getBasicAuthHeader } from "auth/helpers.ts";
import { AccessResponse } from "auth/types.ts";
import { Accessor } from "shared/mod.ts";

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

export class AccessProvider implements Accessor {
	#access_token: string | null = null;

	constructor(
		private readonly opts: {
			readonly client_id: string;
			readonly client_secret: string;
			readonly onRefresh?: (data: AccessResponse) => void | Promise<void>;
		},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || this.#access_token === null) {
			const data = await getAccessToken(this.opts);

			this.#access_token = data.access_token;
			if (this.opts.onRefresh) await this.opts.onRefresh(data);
		}

		return this.#access_token;
	}
}
