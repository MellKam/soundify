import type { HTTPClient } from "../client.ts";
import type { PagingObject, PagingOptions } from "../general.types.ts";
import type {
	AudioAnalysis,
	AudioFeatures,
	Recomendations,
	RecommendationsOptions,
	Track,
} from "./track.types.ts";
import type { Prettify } from "../shared.ts";

/**
 * Get Spotify catalog information for a single track identified
 * by its unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param trackId The Spotify ID for the track
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTrack = async (
	client: HTTPClient,
	trackId: string,
	market?: string,
) => {
	const res = await client.fetch("/v1/tracks/" + trackId, {
		query: { market },
	});
	return res.json() as Promise<Track>;
};

/**
 * Get Spotify catalog information for multiple tracks based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of Spotify track IDs. Maximum 50 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export const getTracks = async (
	client: HTTPClient,
	trackIds: string[],
	market?: string,
) => {
	const res = await client.fetch("/v1/tracks", {
		query: {
			ids: trackIds,
			market,
		},
	});
	return (await res.json() as { tracks: Track[] }).tracks;
};

export type GetSavedTracksOpts = Prettify<
	PagingOptions & {
		/**
		 * An ISO 3166-1 alpha-2 country code.
		 */
		marker?: string;
	}
>;

/**
 * Get a list of the songs saved in the current
 * Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export const getSavedTracks = async (
	client: HTTPClient,
	options: GetSavedTracksOpts,
) => {
	const res = await client.fetch("/v1/me/tracks", {
		query: options,
	});
	return res.json() as Promise<PagingObject<Track>>;
};

/**
 * Save one or more tracks to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of the Spotify track IDs. Maximum 50 IDs
 */
export const saveTracks = (client: HTTPClient, trackIds: string[]) => {
	return client.fetch("/v1/me/tracks", {
		method: "PUT",
		query: {
			ids: trackIds,
		},
	});
};

/**
 * Save track to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export const saveTrack = (client: HTTPClient, trackId: string) => {
	return saveTracks(client, [trackId]);
};

/**
 * Remove one or more tracks from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of the Spotify track IDs. Maximum 50 IDs
 */
export const removeSavedTracks = (
	client: HTTPClient,
	trackIds: string[],
) => {
	return client.fetch("/v1/me/tracks", {
		method: "DELETE",
		query: {
			ids: trackIds,
		},
	});
};

/**
 * Remove track from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export const removeSavedTrack = (
	client: HTTPClient,
	trackId: string,
) => {
	return removeSavedTracks(client, [trackId]);
};

/**
 * Check if one or more tracks is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export const checkIfTracksSaved = async (
	client: HTTPClient,
	track_ids: string[],
) => {
	const res = await client.fetch("/v1/me/tracks/contains", {
		query: {
			ids: track_ids,
		},
	});
	return res.json() as Promise<boolean[]>;
};

/**
 * Check if track is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export const checkIfTrackSaved = async (
	client: HTTPClient,
	trackId: string,
) => {
	return (await checkIfTracksSaved(client, [trackId]))[0];
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
	const res = await client.fetch("/v1/audio-features", {
		query: {
			ids: track_ids,
		},
	});
	return (await res.json() as { audio_features: AudioFeatures[] })
		.audio_features;
};

/**
 * Get audio features for a track based on its Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export const getTrackAudioFeatures = async (
	client: HTTPClient,
	trackId: string,
) => {
	const res = await client.fetch(
		"/v1/audio-features/" + trackId,
	);
	return res.json() as Promise<AudioFeatures>;
};

/**
 * Get a low-level audio analysis for a track in the Spotify catalog.
 * The audio analysis describes the track’s structure and musical content, including rhythm, pitch, and timbre.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export const getTracksAudioAnalysis = async (
	client: HTTPClient,
	trackId: string,
) => {
	const res = await client.fetch("/v1/audio-analysis/" + trackId);
	return res.json() as Promise<AudioAnalysis>;
};

/**
 * Recommendations are generated based on the available information for a given seed entity and matched against similar artists and tracks. If there is sufficient information about the provided seeds, a list of tracks will be returned together with pool size details.

 * @param client Spotify HTTPClient
 * @param options Options and seeds for recomendations
 */
export const getRecommendations = async (
	client: HTTPClient,
	options: RecommendationsOptions,
) => {
	const res = await client.fetch("/v1/srecommendations", {
		query: options,
	});
	return res.json() as Promise<Recomendations>;
};
