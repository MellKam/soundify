import { JSONObject, SearchParams } from "shared/mod.ts";
import { encodeToBase64 } from "auth/platform/platform.deno.ts";

const AUTH_API_ORIGIN = "https://accounts.spotify.com";

export const AUTHORIZE_URL = `${AUTH_API_ORIGIN}/authorize` as const;
export const API_TOKEN_URL = `${AUTH_API_ORIGIN}/api/token` as const;

export const URL_ENCODED = "application/x-www-form-urlencoded";

export const getBasicAuthHeader = (
	clientId: string,
	clientSecret: string,
) => {
	return "Basic " +
		encodeToBase64(
			clientId + ":" + clientSecret,
		);
};

export interface AccessResponse extends JSONObject {
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

export interface ScopedAccessResponse extends AccessResponse, JSONObject {
	/**
	 * A space-separated list of scopes which have been granted
	 * for this `access_token`
	 */
	scope: string;
}

/**
 * Spotify response data containing refresh and access tokens
 */
export interface KeypairResponse extends ScopedAccessResponse, JSONObject {
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

/**
 * Scopes provide Spotify users using third-party apps the confidence that only
 * the information they choose to share will be shared, and nothing more.
 */
export const SCOPES = {
	// Images -------------------------------------------------------------------
	/**
	 * @description Write access to user-provided images.
	 */
	UGC_IMAGE_UPLOAD: "ugc-image-upload",
	// Spotify connect ----------------------------------------------------------
	/**
	 * @description Read access to a user’s player state.
	 */
	USER_READ_PLAYBACK_STATE: "user-read-playback-state",
	/**
	 * @description Write access to a user’s playback state.
	 */
	USER_MODIFY_PLAYBACK_STATE: "user-modify-playback-state",
	/**
	 * @description Read access to a user’s currently playing content.
	 */
	USER_READ_CURRENTLY_PLAYING: "user-read-currently-playing",
	// Playback -----------------------------------------------------------------
	/**
	 * @description Control playback of a Spotify track.
	 *
	 * !The user must have a `Spotify Premium` account.
	 */
	STREAMING: "streaming",
	// Playlist -----------------------------------------------------------------
	/**
	 * @description	Read access to user's private playlists.
	 */
	PLAYLIST_READ_PRIVATE: "playlist-read-private",
	/**
	 * @description
	 * Include collaborative playlists when requesting a user's playlists.
	 */
	PLAYLIST_READ_COLLABORATIVE: "playlist-read-collaborative",
	/**
	 * @description Write access to a user's private playlists.
	 */
	PLAYLIST_MODIFY_PRIVATE: "playlist-modify-private",
	/**
	 * @description Write access to a user's public playlists.
	 */
	PLAYLIST_MODIFY_PUBLIC: "playlist-modify-public",
	// Follow -------------------------------------------------------------------
	/**
	 * @description Write/delete access to the list of artists and other users
	 * that the user follows.
	 */
	USER_FOLLOW_MODIFY: "user-follow-modify",
	/**
	 * @description
	 * Read access to the list of artists and other users that the user follows.
	 */
	USER_FOLLOW_READ: "user-follow-read",
	// Listening History --------------------------------------------------------
	/**
	 * @description Read access to a user’s playback position in a content.
	 */
	USER_READ_PLAYBACK_POSITION: "user-read-playback-position",
	/**
	 * @description Read access to a user's top artists and tracks.
	 */
	USER_TOP_READ: "user-top-read",
	/**
	 * @description Read access to a user’s recently played tracks.
	 */
	USER_READ_RECENTLY_PLAYED: "user-read-recently-played",
	// Library ------------------------------------------------------------------
	/**
	 * @description Write/delete access to a user's "Your Music" library.
	 */
	USER_LIBRARY_MODIFY: "user-library-modify",
	/**
	 * @description Read access to a user's library.
	 */
	USER_LIBRARY_READ: "user-library-read",
	// Users
	/**
	 * @description	Read access to user’s email address.
	 */
	USER_READ_EMAIL: "user-read-email",
	/**
	 * @description
	 * Read access to user’s subscription details (type of user account).
	 */
	USER_READ_PRIVATE: "user-read-private",
} as const;

export type AuthScope = typeof SCOPES[keyof typeof SCOPES];
