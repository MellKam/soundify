import type { NonNullableObject, Prettify } from "../../shared.ts";
import type { Image, PagingObject, PagingOptions } from "../general.types.ts";
import type {
	FeaturedPlaylists,
	Playlist,
	PlaylistTrack,
	SimplifiedPlaylist,
	SnapshotResponse,
} from "./playlist.types.ts";
import type { HTTPClient } from "../../client.ts";

export type PlaylistFieldsOpts = {
	/**
	 * List of item types that your client supports besides the default track type.
	 */
	additional_types?: ("track" | "episode")[];
	/**
	 * Filters for the query: a comma-separated list of the fields to return.
	 * If omitted, all fields are returned.
	 */
	fields?: string;
};

export type GetPlaylistOpts = Prettify<
	PlaylistFieldsOpts & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 * If a country code is specified, only content that is available in that market will be returned.
		 */
		market?: string;
	}
>;

/**
 * Get a playlist owned by a Spotify user
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist
 * @param options Additional options for request
 */
export const getPlaylist = async (
	client: HTTPClient,
	playlistId: string,
	options?: GetPlaylistOpts
) => {
	const res = await client.fetch("/v1/playlists/" + playlistId, {
		query: options,
	});
	return res.json() as Promise<Playlist>;
};

export type ChangePlaylistDetailsBody = {
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
};

/**
 * Change a playlist's name and public/private state. (The user must, of course, own the playlist.)
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param body Changes you want to make to the playlist
 */
export const changePlaylistDetails = (
	client: HTTPClient,
	playlistId: string,
	body: ChangePlaylistDetailsBody
) => {
	return client.fetch("/v1/playlist/" + playlistId, { method: "PUT", body });
};

export type GetPlaylistTracksOpts = Prettify<
	PlaylistFieldsOpts &
		PagingOptions & {
			/**
			 * An ISO 3166-1 alpha-2 country code.
			 * If a country code is specified, only content that is available in that market will be returned.
			 */
			market?: string;
		}
>;

/**
 * Get full details of the items of a playlist owned by a Spotify user
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param options Additional options for request
 */
export const getPlaylistTracks = async (
	client: HTTPClient,
	playlistId: string,
	options?: GetPlaylistTracksOpts
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<PlaylistTrack>>;
};

/**
 * Add one or more items to a user's playlist
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist
 * @param uris List of Spotify URIs to add, can be track or episode URIs
 * @param position The position to insert the items, a zero-based index
 */
export const addItemsToPlaylist = async (
	client: HTTPClient,
	playlistId: string,
	uris: string[],
	position?: number
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "POST",
		query: { uris, position },
	});
	return res.json() as Promise<SnapshotResponse>;
};

/**
 * Add one item to a user's playlist
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist
 * @param uri Spotify URI to add, can be track or episode URI
 * @param position The position to insert the item, a zero-based index
 */
export const addItemToPlaylist = (
	client: HTTPClient,
	playlistId: string,
	uri: string,
	position?: number
) => {
	return addItemsToPlaylist(client, playlistId, [uri], position);
};

export type ReorderPlaylistItemsOpts = {
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
};

/**
 * Reorder items in a playlist depending on the request's parameters.
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param options Additional options for request
 */
export const reorderPlaylistItems = async (
	client: HTTPClient,
	playlistId: string,
	options?: ReorderPlaylistItemsOpts
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "PUT",
		body: options,
	});
	return res.json() as Promise<SnapshotResponse>;
};

/**
 * Replace items in a playlist. Replacing items in a playlist will overwrite its existing items.
 * This operation can be used for replacing or clearing items in a playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 */
export const replacePlaylistItems = async (
	client: HTTPClient,
	playlistId: string,
	uris: string[]
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "PUT",
		body: { uris },
	});
	return res.json() as Promise<SnapshotResponse>;
};

/**
 * Remove one or more items from a user's playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 * @param snapshotId The playlist's snapshot ID against which you want to make the changes.
 */
export const removePlaylistItems = async (
	client: HTTPClient,
	playlistId: string,
	uris: string[],
	snapshotId?: string
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "DELETE",
		body: {
			tracks: uris.map((uri) => ({ uri })),
			snapshot_id: snapshotId,
		},
	});
	return res.json() as Promise<SnapshotResponse>;
};

/**
 * Remove one item from a user's playlist.
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param uri Spotify URI to set, can be track or episode URIs.
 * @param snapshotId The playlist's snapshot ID against which you want to make the changes.
 */
export const removePlaylistItem = (
	client: HTTPClient,
	playlistId: string,
	uri: string,
	snapshotId?: string
) => {
	return removePlaylistItems(client, playlistId, [uri], snapshotId);
};

/**
 * Get a list of the playlists owned or followed by the current Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export const getCurrentUsersPlaylists = async (
	client: HTTPClient,
	options?: PagingOptions
) => {
	const res = await client.fetch("/v1/me/playlists", { query: options });
	return res.json() as Promise<PagingObject<SimplifiedPlaylist>>;
};

/**
 * Get a list of the playlists owned or followed by a Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param userId The user's Spotify user ID.
 * @param options Additional options for request
 */
export const getUsersPlaylists = async (
	client: HTTPClient,
	userId: string,
	options?: PagingOptions
) => {
	const res = await client.fetch(`/v1/users/${userId}/playlists`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedPlaylist>>;
};

export type CreatePlaylistBody = {
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
};

/**
 * Create a playlist for a Spotify user. (The playlist will be empty until you add tracks.)
 *
 * @param client Spotify HTTPClient
 * @param userId The user's Spotify user ID.
 * @param body Data that will be assinged to new playlist
 */
export const createPlaylist = async (
	client: HTTPClient,
	userId: string,
	body: CreatePlaylistBody
) => {
	const res = await client.fetch(`/v1/users/${userId}/playlists`, {
		method: "POST",
		body,
	});
	return res.json() as Promise<Playlist>;
};

export type GetFeaturedPlaylistsOpts = Prettify<
	PagingOptions & {
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
		timestamp?: string;
	}
>;

/**
 * Get a list of Spotify featured playlists (shown, for example, on a Spotify player's 'Browse' tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export const getFeaturedPlaylists = async (
	client: HTTPClient,
	options?: GetFeaturedPlaylistsOpts
) => {
	const res = await client.fetch("/v1/browse/featured-playlists", {
		query: options,
	});
	return res.json() as Promise<FeaturedPlaylists>;
};

export type GetCategorysPlaylistsOpts = Prettify<
	PagingOptions & {
		/**
		 * A country: an ISO 3166-1 alpha-2 country code. Provide this parameter to ensure that the category exists for a particular country.
		 * @example "SE"
		 */
		country: string;
	}
>;

/**
 * Get a list of Spotify playlists tagged with a particular category.
 *
 * @param client Spotify HTTPClient
 * @param categoryId The Spotify category ID for the category.
 * @param options Additional options for request
 */
export const getCategoryPlaylists = async (
	client: HTTPClient,
	categoryId: string,
	options?: GetCategorysPlaylistsOpts
) => {
	const res = await client.fetch(
		`/v1/browse/categories/${categoryId}/playlists`,
		{ query: options }
	);
	return res.json() as Promise<FeaturedPlaylists>;
};

/**
 * Get the current image associated with a specific playlist.
 *
 * @param client Spotify HTTPClient
 */
export const getPlaylistCoverImage = async (
	client: HTTPClient,
	playlistId: string
) => {
	const res = await client.fetch(`/v1/playlists/${playlistId}/images`);
	return res.json() as Promise<NonNullableObject<Image>[]>;
};

/**
 * Upload custom images to the playlist.
 *
 * @param playlistId The Spotify ID of the playlist.
 * @param image The image should contain a Base64 encoded JPEG image data, maximum payload size is 256 KB.
 */
export const uploadPlaylistCoverImage = (
	client: HTTPClient,
	playlistId: string,
	image: string
) => {
	return client.fetch(`/v1/playlists/${playlistId}/images`, {
		method: "PUT",
		headers: {
			"Content-Type": "image/jpeg",
		},
		body: image,
	});
};
