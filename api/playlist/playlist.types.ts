import { UserPublic } from "../index.ts";
import { ExternalUrls, Followers, Image } from "../shared/index.ts";
import { Track } from "../track/index.ts";

export interface Playlist {
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
	owner: UserPublic;
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
	 * The tracks of the playlist.
	 */
	tracks: { href: string; total: number };
	/**
	 * The object type: "playlist"
	 */
	type: string;
	/**
	 * The Spotify URI for the playlist.
	 */
	uri: string;
}

export interface PlaylistTrack {
	/**
	 * The date and time the track or episode was added.
	 * Note: some very old playlists may return null in this field.
	 */
	added_at: string;
	/**
	 * The date and time the track or episode was added.
	 * Note: some very old playlists may return null in this field.
	 */
	added_by: {
		external_urls: ExternalUrls;
		/**
		 * A link to the Web API endpoint returning the full result of the request
		 */
		href: string;
		id: string;
		type: string;
		uri: string;
		name?: string;
	};
	is_local: boolean;
	primary_color: null;
	track: Track;
	video_thumbnail: {
		url: null;
	};
}
