import type { HTTPClient } from "../../client.ts";
import type {
	MarketOptions,
	PagingObject,
	PagingOptions,
} from "../general.types.ts";
import type {
	AudioAnalysis,
	AudioFeatures,
	Recomendations,
	RecommendationsOptions,
	Track,
} from "./track.types.ts";
import type { Prettify } from "../../shared.ts";

/**
 * Get Spotify catalog information for a single track identified
 * by its unique Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param trackId The Spotify ID for the track
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getTrack(
	client: HTTPClient,
	trackId: string,
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Track> {
	const res = await client.fetch("/v1/tracks/" + trackId, {
		query: { market },
	});
	return res.json() as Promise<Track>;
}

/**
 * Get Spotify catalog information for multiple tracks based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of Spotify track IDs. Maximum 50 IDs
 * @param market An ISO 3166-1 alpha-2 country code
 */
export async function getMultipleTracks(
	client: HTTPClient,
	trackIds: string[],
	// deno-lint-ignore ban-types
	market?: (string & {}) | "from_token",
): Promise<Track[]> {
	const res = await client.fetch("/v1/tracks", {
		query: {
			ids: trackIds,
			market,
		},
	});
	return ((await res.json()) as { tracks: Track[] }).tracks;
}

export type GetSavedTracksOptions = Prettify<PagingOptions & MarketOptions>;

/**
 * Get a list of the songs saved in the current
 * Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param options Additional option for request
 */
export async function getSavedTracks(
	client: HTTPClient,
	options: GetSavedTracksOptions,
): Promise<PagingObject<Track>> {
	const res = await client.fetch("/v1/me/tracks", {
		query: options,
	});
	return res.json() as Promise<PagingObject<Track>>;
}

/**
 * Save one or more tracks to the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of the Spotify track IDs. Maximum 50 IDs
 */
export function saveTracks(
	client: HTTPClient,
	trackIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/tracks", {
		method: "PUT",
		query: {
			ids: trackIds,
		},
	});
}

/**
 * Remove one or more tracks from the current user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param trackIds List of the Spotify track IDs. Maximum 50 IDs
 */
export function removeSavedTracks(
	client: HTTPClient,
	trackIds: string[],
): Promise<Response> {
	return client.fetch("/v1/me/tracks", {
		method: "DELETE",
		query: {
			ids: trackIds,
		},
	});
}

/**
 * Check if one or more tracks is already saved in the current Spotify user's 'Your Music' library.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 50 IDs
 */
export async function checkIfTracksSaved(
	client: HTTPClient,
	track_ids: string[],
): Promise<boolean[]> {
	const res = await client.fetch("/v1/me/tracks/contains", {
		query: {
			ids: track_ids,
		},
	});
	return res.json() as Promise<boolean[]>;
}

/**
 * Get audio features for multiple tracks based on their Spotify IDs.
 *
 * @param client Spotify HTTPClient
 * @param track_ids List of the Spotify track IDs. Maximum 100 IDs
 */
export async function getAudioFeaturesForMultipleTracks(
	client: HTTPClient,
	track_ids: string[],
): Promise<AudioFeatures[]> {
	const res = await client.fetch("/v1/audio-features", {
		query: {
			ids: track_ids,
		},
	});
	return ((await res.json()) as { audio_features: AudioFeatures[] })
		.audio_features;
}

/**
 * Get audio features for a track based on its Spotify ID.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export async function getAudioFeaturesForTrack(
	client: HTTPClient,
	trackId: string,
): Promise<AudioFeatures> {
	const res = await client.fetch("/v1/audio-features/" + trackId);
	return res.json() as Promise<AudioFeatures>;
}

/**
 * Get a low-level audio analysis for a track in the Spotify catalog.
 * The audio analysis describes the track’s structure and musical content, including rhythm, pitch, and timbre.
 *
 * @param client Spotify HTTPClient
 * @param trackId Spotify track ID
 */
export async function getAudioAnalysisForTrack(
	client: HTTPClient,
	trackId: string,
): Promise<AudioAnalysis> {
	const res = await client.fetch("/v1/audio-analysis/" + trackId);
	return res.json() as Promise<AudioAnalysis>;
}

/**
 * Recommendations are generated based on the available information for a given seed entity and matched against similar artists and tracks. If there is sufficient information about the provided seeds, a list of tracks will be returned together with pool size details.

 * @param client Spotify HTTPClient
 * @param options Options and seeds for recomendations
 */
export async function getRecommendations(
	client: HTTPClient,
	options: RecommendationsOptions,
): Promise<Recomendations> {
	const res = await client.fetch("/v1/recommendations", {
		query: options,
	});
	return res.json() as Promise<Recomendations>;
}
