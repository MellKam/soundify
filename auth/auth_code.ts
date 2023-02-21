import { searchParamsFromObj } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL, AuthScope } from "./consts.ts";
import { getBasicAuthHeader } from "./helpers.ts";
import {
	AccessTokenResponse,
	ApiTokenReqParams,
	AuthorizeReqParams,
	IAuthProvider,
	KeypairResponse,
} from "./types.ts";

export const getAuthURL = (
	{ scopes, ...opts }: {
		client_id: string;
		scopes?: AuthScope[];
		redirect_uri: string;
		show_dialog?: boolean;
		state?: string;
	},
) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = searchParamsFromObj<AuthorizeReqParams>({
		response_type: "code",
		scope: scopes?.join(" "),
		...opts,
	}).toString();

	return url;
};

export const getGrantData = async (
	opts: {
		code: string;
		state?: string;
		redirect_uri: string;
		client_id: string;
		client_secret: string;
	},
) => {
	const res = await fetch(API_TOKEN_URL, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(opts.client_id, opts.client_secret),
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: searchParamsFromObj<ApiTokenReqParams>({
			code: opts.code,
			redirect_uri: opts.redirect_uri,
			grant_type: "authorization_code",
		}),
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return (await res.json()) as KeypairResponse;
};

export class AuthProvider implements IAuthProvider {
	readonly #BASIC_AUTH_HEADER: string;
	#access_token: string | null = null;

	constructor(
		private readonly config: {
			readonly client_id: string;
			readonly client_secret: string;
			readonly refresh_token: string;
			readonly access_token?: string;
		},
	) {
		this.#BASIC_AUTH_HEADER = getBasicAuthHeader(
			this.config.client_id,
			this.config.client_secret,
		);
		if (this.config.access_token) {
			this.#access_token = this.config.access_token;
		}
	}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || this.#access_token === null) {
			const data = await this.refresh();
			return data.access_token;
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
			body: searchParamsFromObj<ApiTokenReqParams>({
				refresh_token: this.config.refresh_token,
				grant_type: "refresh_token",
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as AccessTokenResponse;
		this.#access_token = data.access_token;
		return data;
	}
}
