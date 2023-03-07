import { ExternalUrls, Followers, Image, PagingObject } from "../shared.ts";
import { UserPublic, UserPublicSimplified } from "../user/user.types.ts";
import { Track } from "../track/track.types.ts";

interface PlaylistBase {
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
	 * Information about the followers of the playlist.
	 */
	followers: Followers;
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
	owner: Omit<UserPublic, "images">;
	/**
	 * The playlist's public/private status:
	 *
	 * `true` => the playlist is public \
	 * `false` => the playlist is private \
	 * `null` => the playlist status is not relevant
	 */
	public: boolean | null;
	/**
	 * The version identifier for the current playlist.
	 * Can be supplied in other requests to target a specific playlist version.
	 */
	snapshot_id: string;
	/**
	 * The object type: "playlist"
	 */
	type: "playlist";
	/**
	 * The Spotify URI for the playlist.
	 */
	uri: string;
}

export interface SimplifiedPlaylist extends PlaylistBase {
	/**
	 * The tracks of the playlist.
	 */
	tracks: {
		href: string;
		total: number;
	};
}

export interface Playlist extends PlaylistBase {
	/**
	 * The tracks of the playlist.
	 */
	tracks: PagingObject<Track>;
}

export interface PlaylistTrack {
	/**
	 * The date and time the track or episode was added.
	 * Note: some very old playlists may return null in this field.
	 */
	added_at: string | null;
	/**
	 * The Spotify user who added the track or episode.
	 * Note: some very old playlists may return null in this field.
	 */
	added_by: UserPublicSimplified;
	/**
	 * Whether this track or episode is a local file or not.
	 */
	is_local: boolean;
	track: Track;
}
