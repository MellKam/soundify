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
 * If a country code is specified, only content that is available
 * in that market will be returned
 */
export const getTrack = async (
	client: ISpotifyClient,
	track_id: string,
	/**
	 * .
	 * .
If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
	 */
	market?: Market,
) => {
	return await client.fetch<Track>(`/tracks/${track_id}`, "json", {
		query: { market },
	});
};
