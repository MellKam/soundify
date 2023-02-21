import { type AuthScope } from "./consts.ts";

export interface AccessTokenResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
}

export interface AccessTokenWithScope extends AccessTokenResponse {
	scope: string;
}

export interface KeypairResponse extends AccessTokenWithScope {
	refresh_token: string;
}

export interface GetAuthURLOptions {
	/**
	 * @description This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
	/**
	 * @description List of scopes.
	 *
	 * @default
	 * If no scopes are specified, authorization will be granted
	 * only to access publicly available information
	 */
	scopes?: AuthScope[];
	/**
	 * @description Whether or not to force the user to approve the app again
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
}

export interface GetAuthURLPKCEOptions extends GetAuthURLOptions {
	code_challenge?: string;
}

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
	getAccessToken: (forceRefresh?: boolean) => Promise<string>;
}
