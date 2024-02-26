import type { Episode } from "../episode/episode.types.ts";
import type {
	ExternalUrls,
	Followers,
	Image,
	PagingObject,
} from "../general.types.ts";
import type { Track } from "../track/track.types.ts";
import type { PublicUser } from "../user/user.types.ts";

export type SnapshotResponse = {
	/** @description The version identifier for the current playlist. Can be supplied in other requests to target a specific playlist version */
	snapshot_id: string;
};

export interface SimplifiedPlaylist {
	/** @description `true` if the owner allows other users to modify the playlist. */
	collaborative: boolean;
	/** @description The playlist description. _Only returned for modified, verified playlists, otherwise_ `null`. */
	description: string | null;
	/** @description Known external URLs for this playlist. */
	external_urls: ExternalUrls;
	/** @description A link to the Web API endpoint providing full details of the playlist. */
	href: string;
	/** @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the playlist. */
	id: string;
	/**
	 * @description Images for the playlist. The array may be empty or contain up to three images. The images are returned by size in descending order. See [Working with Playlists](/documentation/web-api/concepts/playlists).
	 *
	 * **Note**: If returned, the source URL for the image (`url`) is temporary and will expire in less than a day._ */
	images: Image[];
	/** @description The name of the playlist. */
	name: string;
	/** @description The user who owns the playlist */
	owner: PublicUser;
	/** @description The playlist's public/private status: `true` the playlist is public, `false` the playlist is private, `null` the playlist status is not relevant. For more about public/private status, see [Working with Playlists](/documentation/web-api/concepts/playlists) */
	public: boolean | null;
	/** @description The version identifier for the current playlist. Can be supplied in other requests to target a specific playlist version */
	snapshot_id: string;
	/**
	 * @description A collection containing a link ( `href` ) to the Web API endpoint where full details of the playlist's tracks can be retrieved, along with the `total` number of tracks in the playlist.
	 *
	 * Note, a track object may be `null`. This can happen if a track is no longer available. */
	tracks: PlaylistTracksRef;
	/** @description The object type: "playlist" */
	type: "playlist";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the playlist. */
	uri: string;
}

export type PlaylistTracksRef = {
	/**
	 * A link to the Web API endpoint where full details of the playlist’s tracks can be retrieved.
	 */
	href: string;
	/** The total number of tracks in playlist. */
	total: number;
};

export interface PlaylistUser {
	/** @description Known public external URLs for this user. */
	external_urls: ExternalUrls;
	/** @description Information about the followers of this user. */
	followers?: Followers;
	/** @description A link to the Web API endpoint for this user. */
	href: string;
	/** @description The object type. */
	type: "user";
	/** @description The [Spotify user ID](/documentation/web-api/concepts/spotify-uris-ids) for this user. */
	id: string;
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for this user. */
	uri: string;
}

/**
 * The structure containing the details of the Spotify Track in the playlist.
 */
export interface PlaylistTrack {
	/**
	 * The date and time the track or episode was added.
	 * Note: some very old playlists may return null in this field.
	 */
	added_at: string | null;
	/** @description The Spotify user who added the track or episode. _**Note**: some very old playlists may return `null` in this field._ */
	added_by: null;
	/** @description Whether this track or episode is a [local file](/documentation/web-api/concepts/playlists/#local-files) or not. */
	is_local: boolean;
	/** @description Information about the track or episode. */
	track: Track | Episode;
}

export interface Playlist {
	/** @description `true` if the owner allows other users to modify the playlist. */
	collaborative: boolean;
	/** @description The playlist description. _Only returned for modified, verified playlists, otherwise_ `null`. */
	description: string | null;
	/** @description Known external URLs for this playlist. */
	external_urls: ExternalUrls;
	/** @description Information about the followers of the playlist. */
	followers: Followers;
	/** @description A link to the Web API endpoint providing full details of the playlist. */
	href: string;
	/** @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the playlist. */
	id: string;
	/** @description Images for the playlist. The array may be empty or contain up to three images. The images are returned by size in descending order. See [Working with Playlists](/documentation/web-api/concepts/playlists). _**Note**: If returned, the source URL for the image (`url`) is temporary and will expire in less than a day._ */
	images: Image[];
	/** @description The name of the playlist. */
	name: string;
	/** @description The user who owns the playlist */
	owner: PublicUser;
	/** @description The playlist's public/private status: `true` the playlist is public, `false` the playlist is private, `null` the playlist status is not relevant. For more about public/private status, see [Working with Playlists](/documentation/web-api/concepts/playlists) */
	public: boolean | null;
	/** @description The version identifier for the current playlist. Can be supplied in other requests to target a specific playlist version */
	snapshot_id: string;
	/** @description The tracks of the playlist. */
	tracks: PagingObject<PlaylistTrack>;
	/** @description The object type: "playlist" */
	type: "playlist";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the playlist. */
	uri: string;
}

export type FeaturedPlaylists = {
	/**
	 * @description The localized message of a playlist.
	 *
	 * @example "Popular Playlists"
	 */
	message: string;
	playlists: PagingObject<SimplifiedPlaylist>;
};
