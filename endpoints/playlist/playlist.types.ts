import type { Episode } from "../episode/episode.types.ts";
import type {
	ExternalUrls,
	Followers,
	Image,
	PagingObject,
} from "../general.types.ts";
import type { Track } from "../track/track.types.ts";
import type { UserPublic } from "../user/user.types.ts";

export type SnapshotResponse = { snapshot_id: string };

export interface SimplifiedPlaylist {
	/**
	 * `true` if the owner allows other users to modify the playlist.
	 */
	collaborative: boolean;
	/**
	 * The playlist description. Only returned for modified, verified playlists, otherwise `null`.
	 */
	description: string | null;
	/**
	 * Known external URLs for this playlist.
	 */
	external_urls: ExternalUrls;

	/**
	 * A link to the Web API endpoint providing full details of the playlist.
	 */
	href: string;
	/**
	 * The Spotify ID for the playlist.
	 */
	id: string;
	/**
	 * Images for the playlist.
	 * The array may be empty or contain up to three images.
	 * The images are returned by size in descending order.
	 *
	 * Be aware that the links will expire in less than one day.
	 */
	images: Image[];
	/**
	 * The name of the playlist.
	 */
	name: string;
	/**
	 * The user who owns the playlist
	 */
	owner: UserPublic;
	/**
	 * The version identifier for the current playlist.
	 * Can be supplied in other requests to target a specific playlist version.
	 */
	snapshot_id: string;
	type: "playlist";
	/**
	 * The Spotify URI for the playlist.
	 */
	uri: string;
	/** A collection containing a link ( href ) to the Web API endpoint where full details of the playlist’s tracks can be retrieved, along with the total number of tracks in the playlist. */
	tracks: TracksReference;
}

export type TracksReference = {
	/**
	 * A link to the Web API endpoint where full details of the playlist’s tracks can be retrieved.
	 */
	href: string;
	/** The total number of tracks in playlist. */
	total: number;
};

/**
 * The structure containing the details of the Spotify Track in the playlist.
 */
export interface PlaylistTrack {
	/**
	 * The date and time the track or episode was added.
	 * Note: some very old playlists may return null in this field.
	 */
	added_at: string | null;
	/**
	 * The Spotify user who added the track or episode. \
	 * Note: some very old playlists may return null in this field.
	 */
	added_by: {
		type: "user";
		/** The Spotify user ID for this user. */
		id: string;
		uri: string;
		/** Known public external URLs for this user. */
		external_urls: ExternalUrls;
		/** Information about the followers of this user. */
		followers?: Followers;
		/** A link to the Web API endpoint for this user. */
		href: string;
	} | null;
	/**
	 * Whether this track or episode is a local file or not.
	 */
	is_local: boolean;
	track: Track | Episode;
}

export interface Playlist extends SimplifiedPlaylist {
	/**
	 * Information about the followers of the playlist.
	 */
	followers: Followers;
	/**
	 * The playlist's public/private status:
	 *
	 * `true` => the playlist is public \
	 * `false` => the playlist is private \
	 * `null` => the playlist status is not relevant
	 */
	public: boolean | null;
	/**
	 * The tracks of the playlist.
	 */
	tracks: PagingObject<PlaylistTrack>;
}

export type FeaturedPlaylists = {
	/** The message from the featured playlists. */
	message: string;
	/**
	 * The list of the featured playlists wrapped in Paging object.
	 */
	playlists: PagingObject<SimplifiedPlaylist>;
};
