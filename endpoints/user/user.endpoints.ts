import type { Artist } from "../artist/artist.types.ts";
import type { Track } from "../track/track.types.ts";
import type { PrivateUser, PublicUser } from "./user.types.ts";
import type {
	CursorPagingObject,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";

/**
 * Get detailed profile information about the current user.
 *
 * @param client Spotify HTTPClient
 */
export async function getCurrentUser(
	client: HTTPClient,
): Promise<PrivateUser> {
	const res = await client.fetch("/v1/me");
	return res.json();
}

export type GetUserTopItemsOptions = Prettify<
	PagingOptions & {
		/**
		 * Over what time frame the affinities are computed.
		 *
		 * "long_term" => calculated from several years of data and including all new data as it becomes available \
		 * "medium_term" => approximately last 6 months \
		 * "short_term" => approximately last 4 weeks
		 *
		 * @default "medium_term"
		 */
		time_range?: "long_term" | "medium_term" | "short_term";
	}
>;

type UserTopItemMap = {
	artists: Artist;
	tracks: Track;
};

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param type The type of entity to return. ("artists" or "tracks")
 * @param opts Additional option for request
 */
export async function getUserTopItems<TItem extends "artists" | "tracks">(
	client: HTTPClient,
	type: TItem,
	options?: GetUserTopItemsOptions,
): Promise<PagingObject<UserTopItemMap[TItem]>> {
	const res = await client.fetch("/v1/me/top/" + type, { query: options });
	return res.json() as Promise<PagingObject<UserTopItemMap[TItem]>>;
}

/**
 * Get the current user's top artists based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export function getUserTopArtists(
	client: HTTPClient,
	opts?: GetUserTopItemsOptions,
): Promise<PagingObject<Artist>> {
	return getUserTopItems(client, "artists", opts);
}

/**
 * Get the current user's top tracks based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export function getUserTopTracks(
	client: HTTPClient,
	opts?: GetUserTopItemsOptions,
): Promise<PagingObject<Track>> {
	return getUserTopItems(client, "tracks", opts);
}

/**
 * Get public profile information about a Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param userId Spotify user ID
 */
export async function getUser(
	client: HTTPClient,
	userId: string,
): Promise<PublicUser> {
	const res = await client.fetch("/v1/users/" + userId);
	return res.json() as Promise<PublicUser>;
}

/**
 * Add the current user as a follower of a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId Spotify playlist ID
 * @param isPublic If true the playlist will be included in user's public
 * playlists, if false it will remain private. By default - true
 */
export function followPlaylist(
	client: HTTPClient,
	playlistId: string,
	isPublic?: boolean,
): Promise<Response> {
	return client.fetch(`/v1/playlists/${playlistId}/followers`, {
		method: "PUT",
		body: { public: isPublic },
	});
}

/**
 * Remove the current user as a follower of a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId Spotify playlist ID
 */
export function unfollowPlaylist(
	client: HTTPClient,
	playlistId: string,
): Promise<Response> {
	return client.fetch(`/v1/playlists/${playlistId}/followers`, {
		method: "DELETE",
	});
}

export type GetFollowedArtistsOptions = {
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
	/**
	 * The last artist ID retrieved from the previous request.
	 */
	after?: string;
};

/**
 * Get the current user's followed artists.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getFollowedArtists(
	client: HTTPClient,
	options?: GetFollowedArtistsOptions,
): Promise<CursorPagingObject<Artist>> {
	const res = await client.fetch("/v1/me/following", {
		query: {
			...options,
			type: "artist",
		},
	});
	return ((await res.json()) as { artists: CursorPagingObject<Artist> })
		.artists;
}

/**
 * Add the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export function followArtists(
	client: HTTPClient,
	artistIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/following", {
		method: "PUT",
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
}

/**
 * Add the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export function followUsers(
	client: HTTPClient,
	userIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/following", {
		method: "PUT",
		query: {
			type: "user",
			ids: userIds,
		},
	});
}

/**
 * Remove the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export function unfollowArtists(
	client: HTTPClient,
	artistIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/following", {
		method: "DELETE",
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
}

/**
 * Remove the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export function unfollowUsers(
	client: HTTPClient,
	userIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/following", {
		method: "DELETE",
		query: {
			type: "user",
			ids: userIds,
		},
	});
}

/**
 * Check to see if the current user is following one or more artists.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export async function checkIfUserFollowsArtists(
	client: HTTPClient,
	artistIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/following/contains", {
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
	return res.json() as Promise<boolean[]>;
}

/**
 * Check to see if the current user is following one or more Spotify users.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export async function checkIfUserFollowsUsers(
	client: HTTPClient,
	userIds: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/following/contains", {
		query: {
			type: "user",
			ids: userIds,
		},
	});
	return res.json() as Promise<boolean[]>;
}

/**
 * Check to see if one or more Spotify users are following a specified playlist.
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum: 5 ids.
 * @param playlistId Spotify palylist ID
 */
export async function checkIfUsersFollowPlaylist(
	client: HTTPClient,
	userIds: string[],
	playlistId: string,
): Promise<boolean[]> {
	const res = await client.fetch(
		`/v1/playlists/${playlistId}/followers/contains`,
		{
			query: {
				ids: userIds,
			},
		},
	);
	return res.json() as Promise<boolean[]>;
}
