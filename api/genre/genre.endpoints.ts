import { HTTPClient } from "api/client.ts";
import { Genre } from "api/genre/genre.types.ts";

/**
 * Retrieve a list of available genres seed parameter values for recommendations.
 *
 * @param client Spotify HTTPClient
 */
export const getAvailableGenres = async (client: HTTPClient) => {
	return (await client.fetch<{ genres: Genre[] }>(
		"/recommendations/available-genre-seeds",
		"json",
	)).genres;
};
