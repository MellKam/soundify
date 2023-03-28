import { IAuthProvider, toQueryString } from "shared/mod.ts";
import {
	ApiTokenReqParams,
	AuthorizeReqParams,
	AuthScope,
	getBasicAuthHeader,
	KeypairResponse,
	ScopedAccessResponse,
	SPOTIFY_AUTH,
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

/**
 * Creates a URL to redirect users to the Spotify authorization page,
 * where they can grant or deny permission to your app.
 */
export const getRedirectURL = (
	{ scopes, ...opts }: GetRedirectURLOpts,
) => {
	const url = new URL(SPOTIFY_AUTH + "authorize");

	url.search = toQueryString<AuthorizeReqParams>({
		response_type: "code",
		scope: scopes?.join(" "),
		...opts,
	});

	return url;
};

export { parseCallbackData } from "auth/general.ts";

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

/**
 * Retrieves an access and refresh token from the Spotify API
 * using an authorization code and client credentials.
 */
export const getGrantData = async (
	opts: GetGrantDataOpts,
) => {
	const url = new URL(SPOTIFY_AUTH + "api/token");
	url.search = toQueryString<ApiTokenReqParams>({
		code: opts.code,
		redirect_uri: opts.redirect_uri,
		grant_type: "authorization_code",
	});

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(opts.client_id, opts.client_secret),
			"Content-Type": URL_ENCODED,
		},
	});

	if (!res.ok) {
		throw new SpotifyAuthError(await res.text(), res.status);
	}

	return (await res.json()) as KeypairResponse;
};

/**
 * Requests a new access token using your refresh token and client credentials
 */
export const refresh = async (opts: {
	client_id: string;
	client_secret: string;
	refresh_token: string;
}) => {
	const url = new URL(SPOTIFY_AUTH + "api/token");
	url.search = toQueryString<ApiTokenReqParams>({
		refresh_token: opts.refresh_token,
		grant_type: "refresh_token",
	});

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(opts.client_id, opts.client_secret),
			"Content-Type": URL_ENCODED,
		},
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
	access_token: string;
};

export type AuthProviderOpts = {
	onRefresh?: (data: ScopedAccessResponse) => void | Promise<void>;
	onRefreshFailure?: (error: Error) => void | Promise<void>;
};

export class AuthProvider implements IAuthProvider {
	constructor(
		private readonly config: AuthProviderConfig,
		private readonly opts: AuthProviderOpts = {},
	) {}

	static async create(
		config: Omit<AuthProviderConfig, "access_tokne">,
		opts?: AuthProviderOpts,
	) {
		const data = await refresh(config);

		return new AuthProvider(
			{ ...config, access_token: data.access_token },
			opts,
		);
	}

	getToken() {
		return this.config.access_token;
	}

	async refreshToken() {
		try {
			const data = await refresh(this.config);

			this.config.access_token = data.access_token;
			if (this.opts.onRefresh) await this.opts.onRefresh(data);
			return this.config.access_token;
		} catch (error) {
			if (this.opts.onRefreshFailure) {
				await this.opts.onRefreshFailure(error);
			}
			throw error;
		}
	}
}
