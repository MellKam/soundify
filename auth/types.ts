import { type AuthScope } from "./consts.ts";

export interface AccessResponse {
	/**
	 * An Access Token that can be provided in subsequent calls,
	 * for example to Spotify Web API services.
	 */
	access_token: string;
	/**
	 * How the Access Token may be used: always “Bearer”.
	 */
	token_type: "Bearer";
	/**
	 * The time period (in seconds) for which the Access Token is valid.
	 */
	expires_in: number;
}

export interface ScopedAccessResponse extends AccessResponse {
	/**
	 * A space-separated list of scopes which have been granted
	 * for this `access_token`
	 */
	scope: string;
}

/**
 * Spotify response data containing refresh and access tokens
 */
export interface KeypairResponse extends ScopedAccessResponse {
	/**
	 * A token that can be used to generate new `access_token`.
	 */
	refresh_token: string;
}

export type GetAuthURLOptions = {
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

export type AppCredentials = {
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

export type AuthState = {
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
};

export type AuthCode = {
	/**
	 * An authorization code that can be exchanged for an Access Token.
	 * The code that Spotify produces after redirecting to `redirect_uri`.
	 */
	code: string;
};

/**
 * Query parameters for the `GET` request to the `/authorize` endpoint
 */
export interface AuthorizeReqParams
	extends Record<string, string | undefined | boolean> {
	client_id: string;
	response_type: "code" | "token";
	redirect_uri: string;
	state?: string;
	scope?: string;
	show_dialog?: boolean;
	code_challenge_method?: "S256";
	code_challenge?: string;
}

/**
 * Query parameters for the `GET` request to the `/api/token` endpoint
 */
export interface ApiTokenReqParams extends Record<string, string | undefined> {
	refresh_token?: string;
	code?: string;
	redirect_uri?: string;
	client_id?: string;
	code_verifier?: string;
	grant_type: "refresh_token" | "client_credentials" | "authorization_code";
}

export interface IAuthProvider {
	/**
	 * Function that gives you access token.
	 */
	getAccessToken: (
		/**
		 * Should the service refresh the token
		 * @default false
		 */
		forceRefresh?: boolean,
	) => Promise<string>;
	refresh: () => Promise<AccessResponse>;
}
