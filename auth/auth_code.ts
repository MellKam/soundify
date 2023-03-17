import { IAuthProvider, objectToSearchParams } from "shared/mod.ts";
import {
	API_TOKEN_URL,
	ApiTokenReqParams,
	AUTHORIZE_URL,
	AuthorizeReqParams,
	AuthScope,
	getBasicAuthHeader,
	KeypairResponse,
	ScopedAccessResponse,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";

export type GetRedirectURLOpts = {
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

export const getRedirectURL = (
	{ scopes, ...opts }: GetRedirectURLOpts,
) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = objectToSearchParams<AuthorizeReqParams>({
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
};

export { parseCallbackData } from "auth/general.ts";

export const getGrantData = async (
	opts: GetGrantDataOpts,
) => {
	const res = await fetch(API_TOKEN_URL, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(opts.client_id, opts.client_secret),
			"Content-Type": URL_ENCODED,
		},
		body: objectToSearchParams<ApiTokenReqParams>({
			code: opts.code,
			redirect_uri: opts.redirect_uri,
			grant_type: "authorization_code",
		}),
	});

	if (!res.ok) {
		throw new SpotifyAuthError(await res.text(), res.status);
	}

	return (await res.json()) as KeypairResponse;
};

/**
 * Requests a new access token using your refresh token and client data
 */
export const refresh = async (opts: {
	client_id: string;
	client_secret: string;
	refresh_token: string;
}) => {
	const res = await fetch(API_TOKEN_URL, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(opts.client_id, opts.client_secret),
			"Content-Type": URL_ENCODED,
		},
		body: objectToSearchParams<ApiTokenReqParams>({
			refresh_token: opts.refresh_token,
			grant_type: "refresh_token",
		}),
	});

	if (!res.ok) {
		throw new SpotifyAuthError(await res.text(), res.status);
	}

	return (await res.json()) as ScopedAccessResponse;
};

export type AuthProviderConfig = {
	client_id: string;
	client_secret: string;
	refresh_token: string;
	access_token?: string;
};

export type AuthProviderOpts = {
	onRefresh?: (data: ScopedAccessResponse) => void | Promise<void>;
	onRefreshFailure?: (
		error: Error,
	) => Promise<void> | void;
};

export class AuthProvider implements IAuthProvider {
	constructor(
		private readonly config: AuthProviderConfig,
		private readonly opts: AuthProviderOpts = {},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || !this.config.access_token) {
			try {
				const data = await refresh(this.config);

				this.config.access_token = data.access_token;
				if (this.opts.onRefresh) await this.opts.onRefresh(data);
			} catch (error) {
				if (this.opts.onRefreshFailure) {
					await this.opts.onRefreshFailure(error);
				}
				throw error;
			}
		}

		return this.config.access_token;
	}
}
