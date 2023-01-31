export interface SpotifyTokensResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export interface SpotifyAccessTokenResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: number;
	scope: string;
}

/**
 * Query parameters for the `GET` request to the `/authorize` endpoint
 */
export interface RequestUserAuthParams
	extends Record<string, string | undefined | boolean> {
	client_id: string;
	response_type: "code";
	redirect_uri: string;
	state?: string;
	scope?: string;
	show_dialog?: boolean;
}
