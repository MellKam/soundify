import { AuthScope } from "./auth.scopes.ts";

export interface KeypairResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export interface AccessTokenResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
	scope: string;
}

export interface ClientCredentialsResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
}

/**
 * Query parameters for the `GET` request to the `/authorize` endpoint
 */
export interface RequestUserAuthParams
	extends Record<string, string | undefined | boolean> {
	client_id: string;
	response_type: "code" | "token";
	redirect_uri: string;
	state?: string;
	scope?: string;
	show_dialog?: boolean;
}

export interface GetRedirectURIParams {
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
