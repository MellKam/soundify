import { IAuthProvider, toQueryString } from "shared/mod.ts";
import {
	ApiTokenReqParams,
	AuthorizeReqParams,
	AuthScope,
	getBasicAuthHeader,
	KeypairResponse,
	parseCallbackData,
	ScopedAccessResponse,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";

export type GetRedirectURLOpts = {
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

export type OnRefresh = (
	/**
	 * New authorization data that is returned after the update
	 */
	data: ScopedAccessResponse,
) => void | Promise<void>;

export type OnRefreshFailure = (
	/**
	 * Error that occurred during the refresh
	 */
	error: SpotifyAuthError,
) => void | Promise<void>;

export type AuthProviderOpts = {
	access_token?: string;
	/**
	 * A callback event that is triggered after a successful refresh
	 */
	onRefresh?: OnRefresh;
	/**
	 * The callback event that is triggered after a failed token refresh
	 */
	onRefreshFailure?: OnRefreshFailure;
};

export class AuthProvider implements IAuthProvider {
	private refresh_token: string;
	private access_token: string;
	private readonly onRefresh?: OnRefresh;
	private readonly onRefreshFailure?: OnRefreshFailure;

	constructor(
		private readonly authFlow: AuthCode,
		refresh_token: string,
		opts: AuthProviderOpts = {},
	) {
		this.refresh_token = refresh_token;
		this.access_token = opts.access_token ?? "";
		this.onRefresh = opts.onRefresh;
		this.onRefreshFailure = opts.onRefreshFailure;
	}

	getToken() {
		return this.access_token;
	}

	async refreshToken() {
		try {
			const data = await this.authFlow.refresh(this.refresh_token);
			this.access_token = data.access_token;
			if (this.onRefresh) await this.onRefresh(data);

			return this.access_token;
		} catch (error) {
			if (this.onRefreshFailure) await this.onRefreshFailure(error);
			throw error;
		}
	}
}

export type AuthCodeCredentials = {
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 */
	redirect_uri: string;
	client_secret: string;
};

export class AuthCode {
	private readonly basicAuthHeader: string;

	constructor(
		private readonly creds: AuthCodeCredentials,
	) {
		this.basicAuthHeader = getBasicAuthHeader(
			creds.client_id,
			creds.client_secret,
		);
	}

	/**
	 * Creates a URL to redirect users to the Spotify authorization page,
	 * where they can grant or deny permission to your app.
	 */
	getRedirectURL(
		{ scopes, ...opts }: GetRedirectURLOpts = {},
	) {
		const url = new URL(SPOTIFY_AUTH + "authorize");

		url.search = toQueryString<AuthorizeReqParams>({
			response_type: "code",
			scope: scopes?.join(" "),
			client_id: this.creds.client_id,
			redirect_uri: this.creds.redirect_uri,
			...opts,
		});

		return url;
	}

	/**
	 * Retrieves an access and refresh token from the Spotify API
	 * using an authorization code and client credentials.
	 *
	 * @param code An authorization code that can be exchanged for an Access Token.
	 */
	async getGrantData(code: string) {
		const url = new URL(SPOTIFY_AUTH + "api/token");
		url.search = toQueryString<ApiTokenReqParams>({
			code,
			redirect_uri: this.creds.redirect_uri,
			grant_type: "authorization_code",
		});

		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Authorization": this.basicAuthHeader,
				"Content-Type": URL_ENCODED,
			},
		});

		if (!res.ok) {
			throw new SpotifyAuthError(await res.text(), res.status);
		}

		return (await res.json()) as KeypairResponse;
	}

	/**
	 * Requests a new access token using your refresh token and client credentials
	 */
	async refresh(refresh_token: string) {
		const url = new URL(SPOTIFY_AUTH + "api/token");
		url.search = toQueryString<ApiTokenReqParams>({
			refresh_token,
			grant_type: "refresh_token",
		});

		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Authorization": this.basicAuthHeader,
				"Content-Type": URL_ENCODED,
			},
		});

		if (!res.ok) {
			throw new SpotifyAuthError(await res.text(), res.status);
		}

		return (await res.json()) as ScopedAccessResponse;
	}

	static parseCallbackData = parseCallbackData;

	createAuthProvider(refresh_token: string, opts?: AuthProviderOpts) {
		return new AuthProvider(this, refresh_token, opts);
	}
}
