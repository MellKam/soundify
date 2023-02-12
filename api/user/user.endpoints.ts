import { Artist } from "../artist/index.ts";
import { spotifyFetch } from "../fetch.ts";
import { Track } from "../track/track.types.ts";
import { UserPrivate, UserPublic } from "./user.types.ts";
import { PagingObject, PagingOptions } from "../shared/index.ts";
import { type IAuthProvider } from "../../auth/index.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const getCurrentUserProfile = (authProvider: IAuthProvider) => {
	return authProvider.call((accessToken) => {
		return spotifyFetch<UserPrivate>("/me", { accessToken });
	});
};

type GetUserTopItemsOpts = PagingOptions & {
	time_range?: "long_term" | "medium_term" | "short_term";
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
	authProvider: IAuthProvider,
	type: T,
	query: GetUserTopItemsOpts,
) {
	return authProvider.call((accessToken) => {
		return spotifyFetch<PagingObject<M[T]>>(`/me/top/${type}`, {
			query,
			accessToken,
		});
	});
}

/**
 * Get public profile information about a Spotify user.
 */
export const getUserProfile = (
	authProvider: IAuthProvider,
	user_id: string,
) => {
	return authProvider.call((accessToken) => {
		return spotifyFetch<UserPublic>(`/users/${user_id}`, { accessToken });
	});
};
