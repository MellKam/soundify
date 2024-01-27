import type { HTTPClient } from "../client.ts";
import type { PlaybackState, Device } from "./player.types.ts";

export type GetPlaybackStateOpts = {
	/**
	 * An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: string;
	/**
	 * A list of item types that your client supports besides the default track type.
	 */
	additional_types?: ("track" | "episode")[];
};

/**
 * Get information about the user’s current playback state, including track or episode, progress, and active device.
 *
 * @requires `user-read-playback-state`
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export const getPlaybackState = async (
	client: HTTPClient,
	options: GetPlaybackStateOpts = {}
) => {
	const res = await client.fetch("/v1/me/player", {
		query: {
			market: options.market,
			additional_types: options.additional_types?.join(","),
		},
	});
	return res.json() as Promise<PlaybackState>;
};

export type TransferPlaybackBody = {
	/**
	 * A JSON array containing the ID of the device on which playback should be started/transferred.
	 */
	device_ids: string[];
	/**
	 * "true" - ensure playback happens on new device. \
	 * "false" - keep the current playback state.
	 *
	 * @default false
	 */
	play?: boolean;
};

/**
 * Transfer playback to a new device and optionally begin playback. The order of execution is not guaranteed when you use this API with other Player API endpoints.
 *
 * @requires `user-modify-playback-state`
 */
export const transferPlayback = (
	client: HTTPClient,
	body: TransferPlaybackBody
) => {
	return client.fetch("/v1/me/player", { method: "PUT", body });
};

/**
 * Get information about a user’s available Spotify Connect devices. Some device models are not supported and will not be listed in the API response.
 *
 * @requires `user-read-playback-state`
 */
export const getAvailableDevices = async (client: HTTPClient) => {
	const res = await client.fetch("/v1/me/player/devices");
	return res.json() as Promise<Device[]>;
};

export type GetCurrentPlayingTrackOpts = {
	/**
	 * An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
	 */
	market?: string;
	/**
	 * A list of item types that your client supports besides the default track type.
	 */
	additional_types?: ("track" | "episode")[];
};

/**
 * Get the object currently being played on the user's Spotify account.
 *
 * @requires `user-read-currently-playing`
 */
export const getCurrentPlayingTrack = async (
	client: HTTPClient,
	options?: GetCurrentPlayingTrackOpts
) => {
	const res = await client.fetch("/v1/me/player/currently-playing", {
		query: options,
	});
	return res.json() as Promise<PlaybackState>;
};
