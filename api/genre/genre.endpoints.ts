import { ISpotifyClient } from "../../client.ts";
import { Genre } from "./genre.types.ts";

/**
 * Retrieve a list of available genres seed parameter values for recommendations.
 *
 * @param client SpotifyClient instance
 */
export const getAvailableGenreSeeds = async (client: ISpotifyClient) => {
	return (await client.fetch<{ genres: Genre[] }>(
		"/recommendations/available-genre-seeds",
		"json",
	)).genres;
};
