const AUTH_API_ORIGIN = "https://accounts.spotify.com";

export const AUTHORIZE_URL = `${AUTH_API_ORIGIN}/authorize` as const;
export const API_TOKEN_URL = `${AUTH_API_ORIGIN}/api/token` as const;

/**
 * Scopes provide Spotify users using third-party apps the confidence that only
 * the information they choose to share will be shared, and nothing more.
 */
export const AUTH_SCOPES = {
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

export type AuthScope = typeof AUTH_SCOPES[keyof typeof AUTH_SCOPES];
