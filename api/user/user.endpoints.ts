import { Artist } from "../artist/index.ts";
import { Track } from "../track/track.types.ts";
import { UserPrivate, UserPublic } from "./user.types.ts";
import { PagingObject, PagingOptions } from "../shared/index.ts";
import { ISpotifyClient } from "../../client.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const getCurrentUserProfile = (spotifyClient: ISpotifyClient) => {
	return spotifyClient.fetch<UserPrivate>("/me");
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
export const getUserTopItems = <
	T extends TopItemType,
	M extends Record<TopItemType, TopItem> = {
		artists: Artist;
		tracks: Track;
	},
>(
	spotifyClient: ISpotifyClient,
	type: T,
	query: GetUserTopItemsOpts,
) => {
	return spotifyClient.fetch<PagingObject<M[T]>>(`/me/top/${type}`, {
		query,
	});
};

/**
 * Get public profile information about a Spotify user.
 */
export const getUserProfile = (
	spotifyClient: ISpotifyClient,
	user_id: string,
) => {
	return spotifyClient.fetch<UserPublic>(`/users/${user_id}`);
};
