/**
 * @module
 * HTTP Client library that provides a simple interface to the Spotify Web API.
 *
 * ## SpotifyClient
 * The main class that provides fetch method for making requests with build-in functionality for token refreshing, error handling and more.
 *
 * @example
 * ```ts
 * import { SpotifyClient } from "@soundify/web-api";
 *
 * // with access token
 * const client = new SpotifyClient("YOUR_ACCESS_TOKEN");
 *
 * // with automatic token refreshing
 * const client = new SpotifyClient(null, {
 *   // your custom refresher here
 *   refresher: () => Promise.resolve("NEW_ACCESS_TOKEN"),
 * });
 *
 * const res = await client.fetch("/v1/me");
 * const user = await res.json();
 * ```
 *
 * ## Endpoints
 * Functions that utilize the `SpotifyClient` to make requests to the Spotify Web API.
 *
 * @example
 * ```
 * import { SpotifyClient, getCurrentUser } from "@soundify/web-api";
 *
 * const client = new SpotifyClient("YOUR_ACCESS_TOKEN");
 * const user = await getCurrentUser(client);
 *
 * // How endpoint functions are built
 * const getCurrentUser = async (client: SpotifyClient) => {
 *   const res = await client.fetch("/v1/me");
 *   return await res.json();
 * }
 * ```
 *
 * @see https://developer.spotify.com/documentation/web-api
 */
export {
	type FetchLikeOptions,
	type HTTPClient,
	type Middleware,
	type RegularErrorObject,
	SpotifyClient,
	type SpotifyClinetOptions,
	SpotifyError,
} from "./client.ts";
export * from "./endpoints/mod.ts";
