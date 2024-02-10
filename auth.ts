export const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/";

export const OAUTH_SCOPES = {
	/**
	 * Write access to user-provided images.
	 */
	UGC_IMAGE_UPLOAD: "ugc-image-upload",
	/**
	 * Read access to a user’s player state.
	 */
	USER_READ_PLAYBACK_STATE: "user-read-playback-state",
	/**
	 * Write access to a user’s playback state.
	 */
	USER_MODIFY_PLAYBACK_STATE: "user-modify-playback-state",
	/**
	 * Read access to a user’s currently playing content.
	 */
	USER_READ_CURRENTLY_PLAYING: "user-read-currently-playing",
	/**
	 * Control playback of a Spotify track.
	 *
	 * !The user must have a `Spotify Premium` account.
	 */
	STREAMING: "streaming",
	/**
	 * 	Read access to user's private playlists.
	 */
	PLAYLIST_READ_PRIVATE: "playlist-read-private",
	/**
	 * Include collaborative playlists when requesting a user's playlists.
	 */
	PLAYLIST_READ_COLLABORATIVE: "playlist-read-collaborative",
	/**
	 * Write access to a user's private playlists.
	 */
	PLAYLIST_MODIFY_PRIVATE: "playlist-modify-private",
	/**
	 * Write access to a user's public playlists.
	 */
	PLAYLIST_MODIFY_PUBLIC: "playlist-modify-public",
	/**
	 * Write/delete access to the list of artists and other users
	 * that the user follows.
	 */
	USER_FOLLOW_MODIFY: "user-follow-modify",
	/**
	 * Read access to the list of artists and other users that the user follows.
	 */
	USER_FOLLOW_READ: "user-follow-read",
	/**
	 * Read access to a user’s playback position in a content.
	 */
	USER_READ_PLAYBACK_POSITION: "user-read-playback-position",
	/**
	 * Read access to a user's top artists and tracks.
	 */
	USER_TOP_READ: "user-top-read",
	/**
	 * Read access to a user’s recently played tracks.
	 */
	USER_READ_RECENTLY_PLAYED: "user-read-recently-played",
	/**
	 * Write/delete access to a user's "Your Music" library.
	 */
	USER_LIBRARY_MODIFY: "user-library-modify",
	/**
	 * Read access to a user's library.
	 */
	USER_LIBRARY_READ: "user-library-read",
	/**
	 * Read access to user’s email address.
	 */
	USER_READ_EMAIL: "user-read-email",
	/**
	 * Read access to user’s subscription details (type of user account).
	 */
	USER_READ_PRIVATE: "user-read-private",
} as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[keyof typeof OAUTH_SCOPES];
