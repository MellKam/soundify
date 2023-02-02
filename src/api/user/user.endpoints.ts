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

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 */
export function getUserTopItems(
	type: "artists",
	{ query, accessToken }: GetUserTopItemsOpts,
): Promise<PagingObject<Artist>>;
export function getUserTopItems(
	type: "tracks",
	{ query, accessToken }: GetUserTopItemsOpts,
): Promise<PagingObject<Track>>;

export function getUserTopItems(type: "artists" | "tracks", {
	query,
	accessToken,
}: GetUserTopItemsOpts) {
	return spotifyFetch<PagingObject<Artist | Track>>(`/me/top/${type}`, {
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
