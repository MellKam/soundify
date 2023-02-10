import { Artist } from "../artist/index.ts";
import { spotifyFetch } from "../fetch.ts";
import { Track } from "../track/track.types.ts";
import { UserPrivate, UserPublic } from "./user.types.ts";
import { PagingObject, PagingOptions } from "../shared/index.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const getCurrentUserProfile = (accessToken: string) => {
	return spotifyFetch<UserPrivate>("/me", { accessToken });
};

type GetUserTopItemsOpts = {
	accessToken: string;
	query?: PagingOptions & {
		time_range?: "long_term" | "medium_term" | "short_term";
	};
};

type TopItemType = "artists" | "tracks";
type TopItem = Artist | Track;

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 */
export function getUserTopItems<
	T extends TopItemType,
	M extends Record<TopItemType, TopItem> = {
		artists: Artist;
		tracks: Track;
	},
>(
	type: T,
	{
		query,
		accessToken,
	}: GetUserTopItemsOpts,
) {
	return spotifyFetch<PagingObject<M[T]>>(`/me/top/${type}`, {
		query,
		accessToken,
	});
}

/**
 * Get public profile information about a Spotify user.
 */
export const getUserProfile = (
	{ user_id, accessToken }: { user_id: string; accessToken: string },
) => {
	return spotifyFetch<UserPublic>(`/users/${user_id}`, { accessToken });
};
