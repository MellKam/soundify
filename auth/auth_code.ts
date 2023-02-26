import { searchParamsFromObj } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL, AuthScope } from "./consts.ts";
import { getBasicAuthHeader } from "./helpers.ts";
import {
	AccessResponse,
	ApiTokenReqParams,
	AuthorizeReqParams,
	IAuthProvider,
	KeypairResponse,
} from "./types.ts";

export type GetAuthURLOpts = {
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 * This URI needs to have been entered in the _Redirect URI Allowlist_
	 * that you specified when you registered your application.
	 */
	redirect_uri: string;
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
	/**
	 * List of scopes.
	 *
	 * @default
	 * If no scopes are specified, authorization will be granted
	 * only to access publicly available information
	 */
	scopes?: AuthScope[];
	/**
	 * Whether or not to force the user to approve the app again
	 * if they’ve already done so.
	 *
	 * - If false, a user who has already approved the application
	 *  may be automatically redirected to the URI specified by `redirect_uri`.
	 * - If true, the user will not be automatically redirected and will have
	 *  to approve the app again.
	 *
	 * @default false
	 */
	show_dialog?: boolean;
};

export const getAuthURL = (
	{ scopes, ...opts }: GetAuthURLOpts,
) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = searchParamsFromObj<AuthorizeReqParams>({
		response_type: "code",
		scope: scopes?.join(" "),
		...opts,
	}).toString();

	return url;
};

export type GetGrantDataOpts = {
	/**
	 * An authorization code that can be exchanged for an Access Token.
	 * The code that Spotify produces after redirecting to `redirect_uri`.
	 */
	code: string;
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The Client Secret generated after registering your Spotify application.
	 */
	client_secret: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 * This URI needs to have been entered in the _Redirect URI Allowlist_
	 * that you specified when you registered your application.
	 */
	redirect_uri: string;
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
};

export const getGrantData = async (
	opts: GetGrantDataOpts,
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

		const data = (await res.json()) as AccessResponse;
		this.#access_token = data.access_token;
		return data;
	}
}
