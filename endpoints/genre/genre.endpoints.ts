import type { HTTPClient } from "../../client.ts";

/**
 * Retrieve a list of available genres seed parameter values for recommendations.
 *
 * @example ['alternative', 'samba', 'rock', ...]
 */
export async function getAvailableGenreSeeds(
	client: HTTPClient,
): Promise<string[]> {
	const res = await client.fetch("/v1/recommendations/available-genre-seeds");
	return ((await res.json()) as { genres: string[] }).genres;
}
