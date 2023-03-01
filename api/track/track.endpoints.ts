import { ISpotifyClient } from "../../client.ts";
import { Market } from "../shared/index.ts";
import { Track } from "./index.ts";

/**
 * Get Spotify catalog information for a single track identified
 * by its unique Spotify ID.
 *
 * @param client SpotifyClient instance
 * @param track_id The Spotify ID for the track.
 * @param market An ISO 3166-1 alpha-2 country code.
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
 * @param track_ids List of Spotify track IDs. Maximum 50
 * @param market An ISO 3166-1 alpha-2 country code.
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
