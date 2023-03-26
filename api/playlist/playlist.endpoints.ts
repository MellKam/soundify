import { SearchParams } from "shared/mod.ts";
import { Market } from "api/market/market.types.ts";
import { Image, PagingObject, PagingOptions } from "api/general.types.ts";
import {
	FeaturedPlaylists,
	Playlist,
	PlaylistSimplified,
	PlaylistTrack,
} from "api/playlist/playlist.types.ts";
import { HTTPClient } from "api/client.ts";
import { JSONObject, NonNullableJSON } from "api/general.types.ts";

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
		json: body,
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
			json: opts,
		},
	);
};

/**
 * Replace items in a playlist. Replacing items in a playlist will overwrite its existing items.
 * This operation can be used for replacing or clearing items in a playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 */
export const replacePlaylistItems = async (
	client: HTTPClient,
	playlist_id: string,
	uris: string[],
) => {
	return await client.fetch<SnapshotResponse>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			method: "PUT",
			json: { uris },
		},
	);
};

/**
 * Remove one or more items from a user's playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 * @param snapshot_id The playlist's snapshot ID against which you want to make the changes.
 */
export const removePlaylistItems = async (
	client: HTTPClient,
	playlist_id: string,
	uris: string[],
	snapshot_id?: string,
) => {
	return await client.fetch<SnapshotResponse>(
		`/playlists/${playlist_id}/tracks`,
		"json",
		{
			method: "DELETE",
			json: {
				tracks: uris.map((uri) => ({ uri })),
				snapshot_id,
			},
		},
	);
};

/**
 * Remove one item from a user's playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlist_id The Spotify ID of the playlist.
 * @param uri Spotify URI to set, can be track or episode URIs.
 * @param snapshot_id The playlist's snapshot ID against which you want to make the changes.
 */
export const removePlaylistItem = async (
	client: HTTPClient,
	playlist_id: string,
	uri: string,
	snapshot_id?: string,
) => {
	return await removePlaylistItems(client, playlist_id, [uri], snapshot_id);
};

/**
 * Get a list of the playlists owned or followed by the current Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param opts Additional options for request
 */
export const getCurrentUsersPlaylists = async (
	client: HTTPClient,
	opts?: PagingOptions,
) => {
	return await client.fetch<PagingObject<PlaylistSimplified>>(
		"/me/playlists",
		"json",
		{
			query: opts,
		},
	);
};

/**
 * Get a list of the playlists owned or followed by a Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param user_id The user's Spotify user ID.
 * @param opts Additional options for request
 */
export const getUsersPlaylists = async (
	client: HTTPClient,
	user_id: string,
	opts?: PagingOptions,
) => {
	return await client.fetch<PagingObject<PlaylistSimplified>>(
		`/users/${user_id}/playlists`,
		"json",
		{
			query: opts,
		},
	);
};

interface CreatePlaylistBody extends JSONObject {
	/**
	 * The name for the new playlist, for example "Your Coolest Playlist". This name does not need to be unique; a user may have several playlists with the same name.
	 */
	name: string;
	/**
	 * Defaults to true. If true the playlist will be public, if false it will be private. To be able to create private playlists, the user must have granted the playlist-modify-private scope
	 */
	public?: boolean;
	/**
	 * Defaults to false. If true the playlist will be collaborative. Note: to create a collaborative playlist you must also set public to false. To create collaborative playlists you must have granted `playlist-modify-private` and `playlist-modify-public` scopes.
	 */
	collaborative?: boolean;
	/**
	 * Value for playlist description as displayed in Spotify Clients and in the Web API.
	 */
	description?: string;
}

/**
 * Create a playlist for a Spotify user. (The playlist will be empty until you add tracks.)
 *
 * @param client Spotify HTTPClient
 * @param user_id The user's Spotify user ID.
 * @param body Data that will be assinged to new playlist
 */
export const createPlaylist = async (
	client: HTTPClient,
	user_id: string,
	body: CreatePlaylistBody,
) => {
	return await client.fetch<Playlist>(`/users/${user_id}/playlists`, "json", {
		json: body,
		method: "POST",
	});
};

interface GetFeaturedPlaylistsOpts extends SearchParams, PagingOptions {
	/**
	 * A country: an ISO 3166-1 alpha-2 country code. Provide this parameter if you want the list of returned items to be relevant to a particular country. If omitted, the returned items will be relevant to all countries.
	 */
	country?: string;
	/**
	 * The desired language, consisting of a lowercase ISO 639-1 language code and an uppercase ISO 3166-1 alpha-2 country code, joined by an underscore. For example: es_MX, meaning "Spanish (Mexico)". Provide this parameter if you want the results returned in a particular language (where available).
	 *
	 * @example "sv_SE"
	 */
	locale?: string;
	/**
	 * A timestamp in ISO 8601 format: yyyy-MM-ddTHH:mm:ss. Use this parameter to specify the user's local time to get results tailored for that specific date and time in the day. If not provided, the response defaults to the current UTC time. Example: "2014-10-23T09:00:00" for a user whose local time is 9AM. If there were no featured playlists (or there is no data) at the specified time, the response will revert to the current UTC time.
	 *
	 * @example "2014-10-23T09:00:00"
	 */
	timestamp: string;
}

/**
 * Get a list of Spotify featured playlists (shown, for example, on a Spotify player's 'Browse' tab).
 *
 * @param client Spotify HTTPClient
 * @param opts Additional options for request
 */
export const getFeaturedPlaylists = async (
	client: HTTPClient,
	opts?: GetFeaturedPlaylistsOpts,
) => {
	return await client.fetch<FeaturedPlaylists>(
		"/browse/featured-playlists",
		"json",
		{
			query: opts,
		},
	);
};

interface GetCategorysPlaylistsOpts extends SearchParams, PagingOptions {
	/**
	 * A country: an ISO 3166-1 alpha-2 country code. Provide this parameter to ensure that the category exists for a particular country.
	 * @example "SE"
	 */
	country: string;
}

/**
 * Get a list of Spotify playlists tagged with a particular category.
 *
 * @param client Spotify HTTPClient
 * @param category_id The Spotify category ID for the category.
 * @param opts Additional options for request
 */
export const getCategorysPlaylists = async (
	client: HTTPClient,
	category_id: string,
	opts?: GetCategorysPlaylistsOpts,
) => {
	return await client.fetch<FeaturedPlaylists>(
		`/browse/categories/${category_id}/playlists`,
		"json",
		{
			query: opts,
		},
	);
};

/**
 * Get the current image associated with a specific playlist.
 *
 * @param client Spotify HTTPClient
 */
export const getPlaylistCoverImage = async (
	client: HTTPClient,
	playlist_id: string,
) => {
	return await client.fetch<NonNullableJSON<Image>[]>(
		`/playlists/${playlist_id}/images`,
		"json",
	);
};

/**
 * Upload custom images to the playlist.
 *
 * @param playlist_id The Spotify ID of the playlist.
 * @param image The image should contain a Base64 encoded JPEG image data, maximum payload size is 256 KB.
 */
export const uploadPlaylistCoverImage = async (
	client: HTTPClient,
	playlist_id: string,
	image: string,
) => {
	return await client.fetch(`/playlists/${playlist_id}/images`, "void", {
		method: "PUT",
		headers: {
			"Content-Type": "image/jpeg",
		},
		body: image,
	});
};
