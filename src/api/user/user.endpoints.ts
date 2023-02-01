import { spotifyFetch } from "../fetch.ts";

/**
 * Get detailed profile information about the current user
 * (including the current user's username).
 */
export const GET_ME = (accessToken: string) => {
	return spotifyFetch("/me", { accessToken });
};

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 */
export const GET_TOP_ITEMS = ({
	type,
	query,
	accessToken,
}: {
	type: "artists" | "tracks";
	accessToken: string;
	query?: {
		limit?: number;
		offset?: number;
		time_range?: "long_term" | "medium_term" | "short_term";
	};
}) => {
	return spotifyFetch(`/me/top/${type}`, { query, accessToken });
};

/**
 * Get public profile information about a Spotify user.
 */
export const GET_USER_PROFILE = (
	{ user_id, accessToken }: { user_id: string; accessToken: string },
) => {
	return spotifyFetch(`/users/${user_id}`, { accessToken });
};

export const FOLLOW_PLAYLIST = () => {
	return new URL(``);
};
