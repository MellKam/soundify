import { HTTPClient, JSONObject, SearchParams } from "shared/mod.ts";
import { Market } from "api/market/market.types.ts";
import { PagingObject, PagingOptions } from "api/general.types.ts";
import { Playlist, PlaylistTrack } from "api/playlist/playlist.types.ts";

interface PlaylistFieldsOpts extends SearchParams {
	/**
	 * List of item types that your client supports besides the default track type.
	 */
	additional_types?: ("track" | "episode")[];
	/**
	 * Filters for the query: a comma-separated list of the fields to return.
	 * If omitted, all fields are returned.
	 */
	fields?: string;
}

interface GetPlaylistOpts extends SearchParams, PlaylistFieldsOpts {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: Market;
}

/**
 * Get a playlist owned by a Spotify user
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist
 * @param opts Additional options for request
 */
export const getPlaylist = async (
	client: HTTPClient,
	playlist_id: string,
	opts?: GetPlaylistOpts,
) => {
	return await client.fetch<Playlist>("/playlists/" + playlist_id, "json", {
		query: opts,
	});
};

interface ChangePlaylistDetailsBody extends JSONObject {
	/**
	 * The new name for the playlist, for example "My New Playlist Title"
	 */
	name?: string;
	/**
	 * If true the playlist will be public, if false it will be private.
	 */
	public?: boolean;
	/**
	 * If true, the playlist will become collaborative and other users will be able to modify the playlist in their Spotify client.
	 *
	 * Note: You can only set collaborative to true on non-public playlists.
	 */
	collaborative?: boolean;
	/**
	 * Value for playlist description as displayed in Spotify Clients and in the Web API.
	 */
	description?: string;
}

/**
 * Change a playlist's name and public/private state. (The user must, of course, own the playlist.)
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param body Changes you want to make to the playlist
 */
export const changePlaylistDetails = async (
	client: HTTPClient,
	playlist_id: string,
	body: ChangePlaylistDetailsBody,
) => {
	await client.fetch("/playlists/" + playlist_id, "void", {
		method: "PUT",
		body,
	});
};

interface GetPlaylistTracksOpts
	extends SearchParams, PlaylistFieldsOpts, PagingOptions {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 * If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: Market;
}

/**
 * Get full details of the items of a playlist owned by a Spotify user
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param opts Additional options for request
 */
export const getPlaylistTrack = async (
	client: HTTPClient,
	playlist_id: string,
	opts?: GetPlaylistTracksOpts,
) => {
	return await client.fetch<PagingObject<PlaylistTrack>>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			query: opts,
		},
	);
};

type SnapshotResponse = { snapshot_id: string };

/**
 * Add one or more items to a user's playlist
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist
 * @param uris List of Spotify URIs to add, can be track or episode URIs
 * @param position The position to insert the items, a zero-based index
 */
export const addItemsToPlaylist = async (
	client: HTTPClient,
	playlist_id: string,
	uris: string[],
	position?: number,
) => {
	return await client.fetch<SnapshotResponse>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			method: "POST",
			query: {
				uris,
				position,
			},
		},
	);
};

/**
 * Add one item to a user's playlist
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist
 * @param uri Spotify URIs to add, can be track or episode URIs
 * @param position The position to insert the items, a zero-based index
 */
export const addItemToPlaylist = async (
	client: HTTPClient,
	playlist_id: string,
	uri: string,
	position?: number,
) => {
	return await addItemsToPlaylist(client, playlist_id, [uri], position);
};

export interface ReorderPlaylistItemsOpts extends SearchParams {
	/**
	 * The position of the first item to be reordered.
	 */
	range_start?: number;
	/**
	 * The position where the items should be inserted.
	 */
	insert_before?: number;
	/**
	 * The amount of items to be reordered. Defaults to 1 if not set.
	 * The range of items to be reordered begins from the `range_start` position, and includes the `range_length` subsequent items.
	 */
	range_length?: number;
	/**
	 * The playlist's snapshot ID against which you want to make the changes.
	 */
	snapshot_id?: string;
}

/**
 * Reorder items in a playlist depending on the request's parameters.
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param opts Additional options for request
 */
export const reorderPlaylistItems = async (
	client: HTTPClient,
	playlist_id: string,
	opts?: ReorderPlaylistItemsOpts,
) => {
	return await client.fetch<SnapshotResponse>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			method: "PUT",
			body: opts,
		},
	);
};

/**
 * Replace items in a playlist. Replacing items in a playlist will overwrite its existing items.
 * This operation can be used for replacing or clearing items in a playlist.
 *
 * @param client
 * @param playlist_id
 * @param track_uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 * @returns
 */
export const replacePlaylistItems = async (
	client: HTTPClient,
	playlist_id: string,
	track_uris: string[],
) => {
	return await client.fetch<SnapshotResponse>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			method: "PUT",
			body: {
				uris: track_uris,
			},
		},
	);
};
