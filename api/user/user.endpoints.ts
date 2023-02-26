import { Artist } from "../artist/index.ts";
import { Track } from "../track/track.types.ts";
import { UserPrivate, UserPublic } from "./user.types.ts";
import {
	CursorPagingObject,
	PagingObject,
	PagingOptions,
} from "../shared/index.ts";
import { ISpotifyClient } from "../../client.ts";
import { QueryParams } from "../../utils.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const getCurrentUserProfile = (client: ISpotifyClient) => {
	return client.fetch<UserPrivate>("/me", "json");
};

interface GetUserTopItemsOpts extends QueryParams {
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

type TopItemType = "artists" | "tracks";
type TopItem = Artist | Track;

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 */
export const getUserTopItems = <
	T extends TopItemType,
	M extends Record<TopItemType, TopItem> = {
		artists: Artist;
		tracks: Track;
	},
>(
	client: ISpotifyClient,
	/** The type of entity to return. ("artists" or "tracks") */
	type: T,
	query?: GetUserTopItemsOpts & PagingOptions,
) => {
	return client.fetch<PagingObject<M[T]>>(
		`/me/top/${type}`,
		"json",
		{
			query,
		},
	);
};

/**
 * Get public profile information about a Spotify user.
 */
export const getUserProfile = (
	client: ISpotifyClient,
	/** Spotify user ID. */
	user_id: string,
) => {
	return client.fetch<UserPublic>(`/users/${user_id}`, "json");
};

/**
 * Add the current user as a follower of a playlist.
 */
export const followPlaylist = async (
	client: ISpotifyClient,
	playlist_id: string,
	/**
	 * If true the playlist will be included in user's public playlists, if false it will remain private.
	 * @default true
	 */
	is_public?: boolean,
) => {
	await client.fetch(
		`/playlists/${playlist_id}/followers`,
		"void",
		{
			method: "PUT",
			body: typeof is_public !== "undefined"
				? { public: is_public }
				: undefined,
		},
	);
};

/**
 * Remove the current user as a follower of a playlist.
 */
export const unfollowPlaylist = async (
	client: ISpotifyClient,
	playlist_id: string,
) => {
	await client.fetch(
		`/playlists/${playlist_id}/followers`,
		"void",
		{ method: "DELETE" },
	);
};

interface GetFollowedArtistsOpts extends QueryParams {
	/**
	 * The last artist ID retrieved from the previous request.
	 */
	after?: string;
}

/**
 * Get the current user's followed artists.
 */
export const getFollowedArtists = async (
	client: ISpotifyClient,
	opts?: Pick<PagingOptions, "limit"> & GetFollowedArtistsOpts,
) => {
	return await client.fetch<{ artists: CursorPagingObject<Artist> }>(
		"/me/following",
		"json",
		{
			query: {
				type: "artist",
				...opts,
			},
		},
	);
};

/**
 * Add the current user as a follower of one or more artists.
 */
export const followArtists = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify artist IDs. Maximum 50
	 */
	artist_ids: string[],
) => {
	await client.fetch("/me/following", "void", {
		method: "PUT",
		query: {
			type: "artist",
			ids: artist_ids,
		},
	});
};

/**
 * Add the current user as a follower of one or more Spotify users.
 */
export const followUsers = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify user IDs. Maximum 50
	 */
	user_ids: string[],
) => {
	await client.fetch("/me/following", "void", {
		method: "PUT",
		query: {
			type: "user",
			ids: user_ids,
		},
	});
};

/**
 * Remove the current user as a follower of one or more artists.
 */
export const unfollowArtists = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify artist IDs. Maximum 50
	 */
	artist_ids: string[],
) => {
	await client.fetch("/me/following", "void", {
		method: "DELETE",
		query: {
			type: "artist",
			ids: artist_ids,
		},
	});
};

/**
 * Remove the current user as a follower of one or more Spotify users.
 */
export const unfollowUsers = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify user IDs. Maximum 50
	 */
	user_ids: string[],
) => {
	await client.fetch("/me/following", "void", {
		method: "DELETE",
		query: {
			type: "user",
			ids: user_ids,
		},
	});
};

/**
 * Check to see if the current user is following one or more artists.
 */
export const checkIfUserFollowsArtists = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify artist IDs. Maximum 50
	 */
	artist_ids: string[],
) => {
	return await client.fetch<boolean[]>("/me/following/contains", "json", {
		query: {
			type: "artist",
			ids: artist_ids,
		},
	});
};

/**
 * Check to see if the current user is following one or more Spotify users.
 */
export const checkIfUserFollowsUsers = async (
	client: ISpotifyClient,
	/**
	 * List of Spotify user IDs. Maximum 50
	 */
	user_ids: string[],
) => {
	return await client.fetch<boolean[]>("/me/following/contains", "json", {
		query: {
			type: "user",
			ids: user_ids,
		},
	});
};

/**
 * Check to see if one or more Spotify users are following a specified playlist.
 */
export const checkIfUsersFollowsPlaylist = async (
	client: ISpotifyClient,
	playlist_id: string,
	user_ids: string[],
) => {
	return await client.fetch<boolean[]>(
		`/playlists/${playlist_id}/followers/contains`,
		"json",
		{
			query: {
				ids: user_ids,
			},
		},
	);
};
