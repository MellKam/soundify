import type { Prettify } from "../../shared.ts";
import type {
	Image,
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type {
	FeaturedPlaylists,
	Playlist,
	PlaylistTrack,
	SimplifiedPlaylist,
	SnapshotResponse,
} from "./playlist.types.ts";
import type { HTTPClient } from "../../client.ts";

type PlaylistFieldsOptions = {
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

export type GetPlaylistOptions = Prettify<
	PlaylistFieldsOptions & MarketOptions
>;

/**
 * Get a playlist owned by a Spotify user
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist
 * @param options Additional options for request
 */
export async function getPlaylist(
	client: HTTPClient,
	playlistId: string,
	options?: GetPlaylistOptions,
): Promise<Playlist> {
	const res = await client.fetch("/v1/playlists/" + playlistId, {
		query: options,
	});
	return res.json() as Promise<Playlist>;
}

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
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param body Changes you want to make to the playlist
 */
export function changePlaylistDetails(
	client: HTTPClient,
	playlistId: string,
	body: ChangePlaylistDetailsBody,
): Promise<Response> {
	return client.fetch("/v1/playlist/" + playlistId, { method: "PUT", body });
}

export type GetPlaylistTracksOptions = Prettify<
	& PlaylistFieldsOptions
	& PagingOptions
	& MarketOptions
>;

/**
 * Get full details of the items of a playlist owned by a Spotify user
 *
 * @requires `playlist-read-private` if the playlist is private
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param options Additional options for request
 */
export async function getPlaylistTracks(
	client: HTTPClient,
	playlistId: string,
	options?: GetPlaylistTracksOptions,
): Promise<PagingObject<PlaylistTrack>> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<PlaylistTrack>>;
}

/**
 * Add one or more items to a user's playlist
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist
 * @param uris List of Spotify URIs to add, can be track or episode URIs
 * @param position The position to insert the items, a zero-based index
 */
export async function addItemsToPlaylist(
	client: HTTPClient,
	playlistId: string,
	uris: string[],
	position?: number,
): Promise<SnapshotResponse> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "POST",
		query: { uris, position },
	});
	return res.json() as Promise<SnapshotResponse>;
}

export type ReorderPlaylistItemsOptions = {
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
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param options Additional options for request
 */
export async function reorderPlaylistItems(
	client: HTTPClient,
	playlistId: string,
	options: ReorderPlaylistItemsOptions,
): Promise<SnapshotResponse> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "PUT",
		body: options,
	});
	return res.json() as Promise<SnapshotResponse>;
}

/**
 * Replace items in a playlist. Replacing items in a playlist will overwrite its existing items.
 * This operation can be used for replacing or clearing items in a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 */
export async function replacePlaylistItems(
	client: HTTPClient,
	playlistId: string,
	uris: string[],
): Promise<SnapshotResponse> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "PUT",
		body: { uris },
	});
	return res.json() as Promise<SnapshotResponse>;
}

/**
 * Remove one or more items from a user's playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId The Spotify ID of the playlist.
 * @param uris List of Spotify URIs to set, can be track or episode URIs. A maximum of 100 items can be set in one request.
 * @param snapshotId The playlist's snapshot ID against which you want to make the changes.
 */
export async function removePlaylistItems(
	client: HTTPClient,
	playlistId: string,
	uris: string[],
	snapshotId?: string,
): Promise<SnapshotResponse> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/tracks`, {
		method: "DELETE",
		body: {
			tracks: uris.map((uri) => ({ uri })),
			snapshot_id: snapshotId,
		},
	});
	return res.json() as Promise<SnapshotResponse>;
}

/**
 * Get a list of the playlists owned or followed by the current Spotify user.
 *
 * @requires `playlist-read-private` if the playlist is private
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export async function getCurrentUsersPlaylists(
	client: HTTPClient,
	options?: PagingOptions,
): Promise<PagingObject<SimplifiedPlaylist>> {
	const res = await client.fetch("/v1/me/playlists", { query: options });
	return res.json() as Promise<PagingObject<SimplifiedPlaylist>>;
}

/**
 * Get a list of the playlists owned or followed by a Spotify user.
 *
 * @requires `playlist-read-private` if the playlist is private or `playlist-read-collaborative` if the playlist is collaborative
 *
 * @param client Spotify HTTPClient
 * @param userId The user's Spotify user ID.
 * @param options Additional options for request
 */
export async function getUserPlaylists(
	client: HTTPClient,
	userId: string,
	options?: PagingOptions,
): Promise<PagingObject<SimplifiedPlaylist>> {
	const res = await client.fetch(`/v1/users/${userId}/playlists`, {
		query: options,
	});
	return res.json() as Promise<PagingObject<SimplifiedPlaylist>>;
}

export type CreatePlaylistBody = {
	/**
	 * The name for the new playlist, for example "Your Coolest Playlist". This name does not need to be unique; a user may have several playlists with the same name.
	 */
	name: string;
	/**
	 * Defaults to true. If true the playlist will be public, if false it will be private. To be able to create private playlists, the user must have granted the `playlist-modify-private` scope
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
 * Each user is generally limited to a maximum of 11000 playlists.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param userId The user's Spotify user ID.
 * @param body Data that will be assinged to new playlist
 */
export async function createPlaylist(
	client: HTTPClient,
	userId: string,
	body: CreatePlaylistBody,
): Promise<Playlist> {
	const res = await client.fetch(`/v1/users/${userId}/playlists`, {
		method: "POST",
		body,
	});
	return res.json() as Promise<Playlist>;
}

export type GetFeaturedPlaylistsOptions = Prettify<
	PagingOptions & {
		/**
		 * The desired language, consisting of a lowercase ISO 639-1 language code and an uppercase ISO 3166-1 alpha-2 country code, joined by an underscore. For example: es_MX, meaning "Spanish (Mexico)". Provide this parameter if you want the results returned in a particular language (where available).
		 *
		 * @example "sv_SE"
		 */
		locale?: string;
	}
>;

/**
 * Get a list of Spotify featured playlists (shown, for example, on a Spotify player's 'Browse' tab).
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export async function getFeaturedPlaylists(
	client: HTTPClient,
	options?: GetFeaturedPlaylistsOptions,
): Promise<FeaturedPlaylists> {
	const res = await client.fetch("/v1/browse/featured-playlists", {
		query: options,
	});
	return res.json() as Promise<FeaturedPlaylists>;
}

/**
 * Get a list of Spotify playlists tagged with a particular category.
 *
 * @param client Spotify HTTPClient
 * @param categoryId The Spotify category ID for the category.
 * @param options Additional options for request
 */
export async function getCategoryPlaylists(
	client: HTTPClient,
	categoryId: string,
	options?: PagingOptions,
): Promise<FeaturedPlaylists> {
	const res = await client.fetch(
		`/v1/browse/categories/${categoryId}/playlists`,
		{ query: options },
	);
	return res.json() as Promise<FeaturedPlaylists>;
}

/**
 * Get the current image associated with a specific playlist.
 *
 * @param client Spotify HTTPClient
 */
export async function getPlaylistCoverImage(
	client: HTTPClient,
	playlistId: string,
): Promise<Image[]> {
	const res = await client.fetch(`/v1/playlists/${playlistId}/images`);
	return res.json() as Promise<Image[]>;
}

/**
 * Upload custom images to the playlist.
 *
 * @requires `ugc-image-upload`, `playlist-modify-public` or `playlist-modify-private`
 *
 * @param playlistId The Spotify ID of the playlist.
 * @param image The image should contain a Base64 encoded JPEG image data, maximum payload size is 256 KB.
 */
export function uploadPlaylistCoverImage(
	client: HTTPClient,
	playlistId: string,
	image: string,
): Promise<Response> {
	return client.fetch(`/v1/playlists/${playlistId}/images`, {
		method: "PUT",
		headers: {
			"Content-Type": "image/jpeg",
		},
		body: image,
	});
}
