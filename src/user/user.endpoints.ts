import type { Artist } from "../artist/artist.types.ts";
import type { Track } from "../track/track.types.ts";
import type { UserPrivate, UserPublic } from "./user.types.ts";
import type {
	CursorPagingObject,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type { HTTPClient } from "../client.ts";
import type { Prettify } from "../shared.ts";

/**
 * Get detailed profile information about the current user.
 *
 * @param client Spotify HTTPClient
 */
export const getCurrentUser = async (client: HTTPClient) => {
	const res = await client.fetch("/v1/me");
	return res.json() as Promise<UserPrivate>;
};

export type GetUserTopItemsOpts = Prettify<
	PagingOptions & {
		/**
		 * Over what time frame the affinities are computed.
		 *
		 * "long_term" => calculated from several years of data \
		 * "medium_term" => approximately last 6 months) \
		 * "short_term" => approximately last 4 weeks
		 *
		 * @default "medium_term"
		 */
		time_range?: "long_term" | "medium_term" | "short_term";
	}
>;

export type UserTopItemType = "artists" | "tracks";
export type UserTopItem = Artist | Track;
interface UserTopItemMap extends Record<UserTopItemType, UserTopItem> {
	artists: Artist;
	tracks: Track;
}

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
export const getUserTopItems = async <T extends UserTopItemType>(
	client: HTTPClient,
	type: T,
	options?: GetUserTopItemsOpts,
) => {
	const res = await client.fetch("/v1/me/top/" + type, { query: options });
	return res.json() as Promise<PagingObject<UserTopItemMap[T]>>;
};

/**
 * Get the current user's top artists based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getUserTopArtists = async (
	client: HTTPClient,
	opts: GetUserTopItemsOpts,
) => {
	return await getUserTopItems(client, "artists", opts);
};

/**
 * Get the current user's top tracks based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getUserTopTracks = async (
	client: HTTPClient,
	opts: GetUserTopItemsOpts,
) => {
	return await getUserTopItems(client, "tracks", opts);
};

/**
 * Get public profile information about a Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param userId Spotify user ID
 */
export const getUser = async (client: HTTPClient, userId: string) => {
	const res = await client.fetch("/v1/users/" + userId);
	return res.json() as Promise<UserPublic>;
};

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
export const followPlaylist = async (
	client: HTTPClient,
	playlistId: string,
	isPublic?: boolean,
) => {
	await client.fetch(`/v1/playlists/${playlistId}/followers`, {
		method: "PUT",
		body: { public: isPublic },
	});
};

/**
 * Remove the current user as a follower of a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlistId Spotify playlist ID
 */
export const unfollowPlaylist = async (
	client: HTTPClient,
	playlistId: string,
) => {
	await client.fetch(`/v1/playlists/${playlistId}/followers`, {
		method: "DELETE",
	});
};

export type GetFollowedArtistsOpts = {
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
export const getFollowedArtists = async (
	client: HTTPClient,
	options?: GetFollowedArtistsOpts,
) => {
	const res = await client.fetch("/v1/me/following", {
		query: {
			...options,
			type: "artist",
		},
	});
	return ((await res.json()) as { artists: CursorPagingObject<Artist> })
		.artists;
};

/**
 * Add the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export const followArtists = (client: HTTPClient, artistIds: string[]) => {
	return client.fetch("/v1/me/following", {
		method: "PUT",
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
};

/**
 * Add the current user as a follower of an artist.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export const followArtist = (client: HTTPClient, artistId: string) => {
	return followArtists(client, [artistId]);
};

/**
 * Add the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export const followUsers = (client: HTTPClient, userIds: string[]) => {
	return client.fetch("/v1/me/following", {
		method: "PUT",
		query: {
			type: "user",
			ids: userIds,
		},
	});
};

/**
 * Add the current user as a follower of an user.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify user ID
 */
export const followUser = (client: HTTPClient, userId: string) => {
	return followUsers(client, [userId]);
};

/**
 * Remove the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export const unfollowArtists = (client: HTTPClient, artistIds: string[]) => {
	return client.fetch("/v1/me/following", {
		method: "DELETE",
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
};

/**
 * Remove the current user as a follower of specified artist.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export const unfollowArtist = (client: HTTPClient, artistId: string) => {
	return unfollowArtists(client, [artistId]);
};

/**
 * Remove the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export const unfollowUsers = (client: HTTPClient, userIds: string[]) => {
	return client.fetch("/v1/me/following", {
		method: "DELETE",
		query: {
			type: "user",
			ids: userIds,
		},
	});
};

/**
 * Remove the current user as a follower of specified Spotify user.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify user ID
 */
export const unfollowUser = (client: HTTPClient, userId: string) => {
	return unfollowUsers(client, [userId]);
};

/**
 * Check to see if the current user is following one or more artists.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param artistIds List of Spotify artist IDs. Maximum 50
 */
export const checkIfUserFollowsArtists = async (
	client: HTTPClient,
	artistIds: string[],
) => {
	const res = await client.fetch("/v1/me/following/contains", {
		query: {
			type: "artist",
			ids: artistIds,
		},
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check to see if the current user is following artist.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param artistId Spotify artist ID
 */
export const checkIfUserFollowsArtist = async (
	client: HTTPClient,
	artistId: string,
) => {
	return (await checkIfUserFollowsArtists(client, [artistId]))[0]!;
};

/**
 * Check to see if the current user is following one or more Spotify users.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum 50
 */
export const checkIfUserFollowsUsers = async (
	client: HTTPClient,
	userIds: string[],
) => {
	const res = await client.fetch("/v1/me/following/contains", {
		query: {
			type: "user",
			ids: userIds,
		},
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check to see if the current user is following artist.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param userId Spotify user ID
 */
export const checkIfUserFollowsUser = async (
	client: HTTPClient,
	userId: string,
) => {
	return (await checkIfUserFollowsUsers(client, [userId]))[0]!;
};

/**
 * Check to see if one or more Spotify users are following a specified playlist.
 *
 * @param client Spotify HTTPClient
 * @param userIds List of Spotify user IDs. Maximum: 5 ids.
 * @param playlistId Spotify palylist ID
 */
export const checkIfUsersFollowPlaylist = async (
	client: HTTPClient,
	userIds: string[],
	playlistId: string,
) => {
	const res = await client.fetch(
		`/v1/playlists/${playlistId}/followers/contains`,
		{
			query: {
				ids: userIds,
			},
		},
	);
	return res.json() as Promise<boolean[]>;
};

/**
 * Check to see Spotify user is following a specified playlist.
 *
 * @param client Spotify HTTPClient
 * @param userId Spotify user ID
 * @param playlistId Spotify palylist ID
 */
export const checkIfUserFollowsPlaylist = async (
	client: HTTPClient,
	userId: string,
	playlistId: string,
) => {
	return (await checkIfUsersFollowPlaylist(client, [userId], playlistId))[0]!;
};
