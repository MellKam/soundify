import { Artist } from "../artist/index.ts";
import { Track } from "../track/track.types.ts";
import { UserPrivate, UserPublic } from "./user.types.ts";
import { PagingObject, PagingOptions } from "../shared/index.ts";
import { ISpotifyClient } from "../../client.ts";
import { QueryParams } from "../../utils.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const getCurrentUserProfile = (client: ISpotifyClient) => {
	return client.fetch<UserPrivate>("/me");
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
	return client.fetch<UserPublic>(`/users/${user_id}`);
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
	await client.fetch(`/playlists/${playlist_id}/followers`, {
		method: "PUT",
		body: typeof is_public !== "undefined" ? { public: is_public } : undefined,
	});
};
