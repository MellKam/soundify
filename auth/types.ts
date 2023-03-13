import { SearchParams } from "../shared/mod.ts";

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

/**
 * Search parameters for the `GET` request to the `/authorize` endpoint
 */
export interface AuthorizeReqParams extends SearchParams {
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
 * Search parameters for the `GET` request to the `/api/token` endpoint
 */
export interface ApiTokenReqParams extends SearchParams {
	refresh_token?: string;
	code?: string;
	redirect_uri?: string;
	client_id?: string;
	code_verifier?: string;
	grant_type: "refresh_token" | "client_credentials" | "authorization_code";
}
