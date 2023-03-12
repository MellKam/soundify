import { HTTPClient } from "shared/mod.ts";
import { Market } from "api/market/market.types.ts";
import { PagingObject, PagingOptions } from "api/general.types.ts";
import {
	AudioAnalysis,
	AudioFeatures,
	GetRecommendationsOpts,
	Recomendations,
	Track,
} from "api/track/track.types.ts";

/**
 * Get Spotify catalog information for a single track identified
 * by its unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param track_id The Spotify ID for the track
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTrack = async (
	client: HTTPClient,
	track_id: string,
	market?: Market,
) => {
	return await client.fetch<Track>("/tracks/" + track_id, "json", {
		query: { market },
	});
};

/**
 * Get Spotify catalog information for multiple tracks based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of Spotify track IDs. Maximum 50 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTracks = async (
	client: HTTPClient,
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
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getSavedTracks = async (
	client: HTTPClient,
	opts: GetSavedTracksOpts,
) => {
	return await client.fetch<PagingObject<Track>>("/me/tracks", "json", {
		query: opts,
	});
};

/**
 * Save one or more tracks to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const saveTracks = async (
	client: HTTPClient,
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
 * @param client Spotify HTTPClient
 * @param track_id Spotify track ID
 */
export const saveTrack = async (client: HTTPClient, track_id: string) => {
	await saveTracks(client, [track_id]);
};

/**
 * Remove one or more tracks from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const removeSavedTracks = async (
	client: HTTPClient,
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
 * @param client Spotify HTTPClient
 * @param track_id Spotify track ID
 */
export const removeSavedTrack = async (
	client: HTTPClient,
	track_id: string,
) => {
	await removeSavedTracks(client, [track_id]);
};

/**
 * Check if one or more tracks is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const checkSavedTracks = async (
	client: HTTPClient,
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
 * @param client Spotify HTTPClient
 * @param track_id Spotify track ID
 */
export const checkSavedTrack = async (
	client: HTTPClient,
	track_id: string,
) => {
	return (await checkSavedTracks(client, [track_id]))[0];
};

/**
 * Get audio features for multiple tracks based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 100 IDs
 */
export const getTracksAudioFeatures = async (
	client: HTTPClient,
	track_ids: string[],
) => {
	return (await client.fetch<{ audio_features: AudioFeatures[] }>(
		"/audio-features",
		"json",
		{
			query: {
				ids: track_ids,
			},
		},
	)).audio_features;
};

/**
 * Get audio features for a track based on its Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param track_id Spotify track ID
 */
export const getTrackAudioFeatures = async (
	client: HTTPClient,
	track_id: string,
) => {
	return await client.fetch<AudioFeatures>(
		"/audio-features/" + track_id,
		"json",
	);
};

/**
 * Get a low-level audio analysis for a track in the Spotify catalog.
 * The audio analysis describes the track’s structure and musical content, including rhythm, pitch, and timbre.
 *
 * @param client Spotify HTTPClient
 * @param track_id Spotify track ID
 */
export const getTracksAudioAnalysis = async (
	client: HTTPClient,
	track_id: string,
) => {
	return await client.fetch<AudioAnalysis>(
		"/audio-analysis/" + track_id,
		"json",
	);
};

/**
 * Recommendations are generated based on the available information for a given seed entity and matched against similar artists and tracks. If there is sufficient information about the provided seeds, a list of tracks will be returned together with pool size details.

 * @param client Spotify HTTPClient
 * @param opts Options and seeds for recomendations
 */
export const getRecommendations = async (
	client: HTTPClient,
	opts: GetRecommendationsOpts,
) => {
	return await client.fetch<Recomendations>("/recommendations", "json", {
		query: opts,
	});
};
