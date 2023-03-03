import { ISpotifyClient } from "../../client.ts";
import { Market, PagingOptions } from "../shared/index.ts";
import { PagingObject } from "../shared/paging.ts";
import { Track } from "./index.ts";

/**
 * Get Spotify catalog information for a single track identified
 * by its unique Spotify ID.
 *
 * @param client SpotifyClient instance
 * @param track_id The Spotify ID for the track
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTrack = async (
	client: ISpotifyClient,
	track_id: string,
	market?: Market,
) => {
	return await client.fetch<Track>(`/tracks/${track_id}`, "json", {
		query: { market },
	});
};

/**
 * Get Spotify catalog information for multiple tracks based on their Spotify IDs.
 *
 * @param client SpotifyClient instance
 * @param track_ids List of Spotify track IDs. Maximum 50 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTracks = async (
	client: ISpotifyClient,
	track_ids: string[],
	market?: Market,
) => {
	return (await client.fetch<{ tracks: Track[] }>("/tracks", "json", {
		query: {
			ids: track_ids,
			market,
		},
	})).tracks;
};

interface GetSavedTracksOpts extends PagingOptions {
	/**
	 * An ISO 3166-1 alpha-2 country code.
	 */
	marker?: Market;
}

/**
 * Get a list of the songs saved in the current
 * Spotify user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param opts Additional option for request
 */
export const getSavedTracks = async (
	client: ISpotifyClient,
	opts: GetSavedTracksOpts,
) => {
	return await client.fetch<PagingObject<Track>>("/me/tracks", "json", {
		query: opts,
	});
};

/**
 * Save one or more tracks to the current user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const saveTracks = async (
	client: ISpotifyClient,
	track_ids: string[],
) => {
	await client.fetch("/me/tracks", "void", {
		method: "PUT",
		query: {
			ids: track_ids,
		},
	});
};

/**
 * Save track to the current user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_id Spotify track ID
 */
export const saveTrack = async (client: ISpotifyClient, track_id: string) => {
	await saveTracks(client, [track_id]);
};

/**
 * Remove one or more tracks from the current user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const removeSavedTracks = async (
	client: ISpotifyClient,
	track_ids: string[],
) => {
	await client.fetch("/me/tracks", "void", {
		method: "DELETE",
		query: {
			ids: track_ids,
		},
	});
};

/**
 * Remove track from the current user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_id Spotify track ID
 */
export const removeSavedTrack = async (
	client: ISpotifyClient,
	track_id: string,
) => {
	await removeSavedTracks(client, [track_id]);
};

/**
 * Check if one or more tracks is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const checkSavedTracks = async (
	client: ISpotifyClient,
	track_ids: string[],
) => {
	return await client.fetch<boolean[]>("/me/tracks/contains", "json", {
		query: {
			ids: track_ids,
		},
	});
};

/**
 * Check if track is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client SpotifyClient instance
 * @param track_ids potify track ID
 */
export const checkSavedTrack = async (
	client: ISpotifyClient,
	track_id: string,
) => {
	return (await checkSavedTracks(client, [track_id]))[0];
};