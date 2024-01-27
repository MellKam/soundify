import type { HTTPClient } from "../client.ts";

/**
 * Retrieve a list of available genres seed parameter values for recommendations.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableGenres = async (client: HTTPClient) => {
	const res = await client.fetch("/v1/recommendations/available-genre-seeds");
	return ((await res.json()) as { genres: string[] }).genres;
};
