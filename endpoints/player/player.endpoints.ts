import type { HTTPClient } from "../../client.ts";
import type { Prettify } from "../../shared.ts";
import type { CursorPagingObject, MarketOptions } from "../general.types.ts";
import type {
	CurrentlyPlayingContext,
	Device,
	PlayHistory,
	Queue,
	RepeatMode,
} from "./player.types.ts";

export type GetPlaybackStateOptions = Prettify<
	MarketOptions & {
		/**
		 * A list of item types that your client supports besides the default track type.
		 */
		additional_types?: ("track" | "episode")[];
	}
>;

/**
 * Get information about the user’s current playback state, including track or episode, progress, and active device.
 *
 * @requires `user-read-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param options Additional options for request
 */
export async function getPlaybackState(
	client: HTTPClient,
	options: GetPlaybackStateOptions = {},
): Promise<CurrentlyPlayingContext | null> {
	const res = await client.fetch("/v1/me/player", {
		query: {
			market: options.market,
			additional_types: options.additional_types?.join(","),
		},
	});
	if (res.status === 204) return null;
	return res.json();
}

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
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 */
export function transferPlayback(
	client: HTTPClient,
	body: TransferPlaybackBody,
): Promise<Response> {
	return client.fetch("/v1/me/player", { method: "PUT", body });
}

/**
 * Get information about a user’s available Spotify Connect devices. Some device models are not supported and will not be listed in the API response.
 *
 * @requires `user-read-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 */
export async function getAvailableDevices(
	client: HTTPClient,
): Promise<Device[]> {
	const res = await client.fetch("/v1/me/player/devices");
	return ((await res.json()) as { devices: Device[] }).devices;
}

export type GetCurrentPlayingTrackOptions = Prettify<
	MarketOptions & {
		/**
		 * A list of item types that your client supports besides the default track type.
		 */
		additional_types?: ("track" | "episode")[];
	}
>;

/**
 * Get the object currently being played on the user's Spotify account.
 *
 * @requires `user-read-currently-playing` \
 * **The user must have a Spotify Premium subscription.**
 */
export async function getCurrentPlayingTrack(
	client: HTTPClient,
	options?: GetCurrentPlayingTrackOptions,
): Promise<CurrentlyPlayingContext | null> {
	const res = await client.fetch("/v1/me/player/currently-playing", {
		query: options,
	});
	if (res.status === 204) return null;
	return res.json() as Promise<CurrentlyPlayingContext>;
}

export type StartResumePlaybackBody = {
	/**
	 * The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
	 */
	device_id?: string;
	/**
	 * The position to start playback. Must be a positive number.
	 */
	position_ms?: number;
	/**
	 * Spotify URI of the context to play. Valid contexts are albums, artists & playlists.
	 *
	 * @example "spotify:album:1Je1IMUlBXcx1Fz0WE7oPT"
	 */
	context_uri?: string;
	/**
	 * A JSON array of the Spotify track URIs to play.
	 *
	 * @example
	 * ```json
	 * ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
	 * "spotify:track:1301WleyT98MSxVHPZCA6M"]
	 * ```
	 */
	uris?: string[];
	/**
	 * @description Indicates from where in the context playback should start. Only available when context_uri corresponds to an album or playlist object
	 * "position" is zero based and can’t be negative. Example: `"offset": {"position": 5}`
	 * "uri" is a string representing the uri of the item to start at. Example: `"offset": {"uri": "spotify:track:1301WleyT98MSxVHPZCA6M"}`
	 */
	offset?: {
		/**
		 * The index of the first track to play.
		 */
		position?: number;
		/**
		 * The track URI in the context.
		 */
		uri?: string;
	};
};

/**
 * Start a new context or resume current playback on the user’s active device.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 */
export function startPlayback(
	client: HTTPClient,
	options: StartResumePlaybackBody = {},
): Promise<Response> {
	const { device_id, ...body } = options;
	return client.fetch("/v1/me/player/play", {
		method: "PUT",
		body,
		query: { device_id },
	});
}

/**
 * Start a new context or resume current playback on the user’s active device.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 */
export function resumePlayback(
	client: HTTPClient,
	options?: StartResumePlaybackBody,
) {
	return startPlayback(client, options);
}

/**
 * Pause playback on the user’s account.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function pausePlayback(
	client: HTTPClient,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/pause", {
		method: "PUT",
		query: { device_id: deviceId },
	});
}

/**
 * Skips to next track in the user’s queue.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function skipToNext(
	client: HTTPClient,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/next", {
		method: "POST",
		query: { device_id: deviceId },
	});
}

/**
 * Skips to previous track in the user’s queue.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function skipToPrevious(
	client: HTTPClient,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/previous", {
		method: "POST",
		query: { device_id: deviceId },
	});
}

/**
 * Seeks to the given position in the user’s currently playing track.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param positionMs The position in milliseconds to seek to. Must be a positive number. Passing in a position that is greater than the length of the track will cause the player to start playing the next song.
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function seekToPosition(
	client: HTTPClient,
	positionMs: number,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/seek", {
		method: "PUT",
		query: { position_ms: positionMs, device_id: deviceId },
	});
}

/**
 * Set the repeat mode for the user's playback.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param state
 * `track` - will repeat the current track. \
 * `context` - will repeat the current context. \
 * `off` - will turn repeat off.
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function setRepeatMode(
	client: HTTPClient,
	state: RepeatMode,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/repeat", {
		method: "PUT",
		query: { state, device_id: deviceId },
	});
}

/**
 * Toggle shuffle on or off for user’s playback.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param state `true` to turn shuffle on, `false` to turn it off.
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function togglePlaybackShuffle(
	client: HTTPClient,
	state: boolean,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/shuffle", {
		method: "PUT",
		query: { state, device_id: deviceId },
	});
}

export type GetRecentlyPlayedTracksOptions = {
	/**
	 * The maximum number of items to return. Minimum: 1. Maximum: 50.
	 * @default 20
	 */
	limit?: number;
	/**
	 * A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified.
	 *
	 * @example 1484811043508
	 */
	after?: number;
	/**
	 * A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified.
	 */
	before?: number;
};

/**
 * Get tracks from the current user's recently played tracks.
 *
 * @requires `user-read-recently-played` \
 * **The user must have a Spotify Premium subscription.**
 */
export async function getRecentPlayedTracks(
	client: HTTPClient,
	options?: GetRecentlyPlayedTracksOptions,
): Promise<CursorPagingObject<PlayHistory>> {
	const res = await client.fetch("/v1/me/player/recently-played", {
		query: options,
	});
	return res.json();
}

/**
 * Get the list of objects that make up the user's queue.
 *
 * @requires `user-read-currently-playing`, `user-read-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 */
export async function getUserQueue(client: HTTPClient): Promise<Queue> {
	const res = await client.fetch("/v1/me/player/queue");
	return res.json() as Promise<Queue>;
}

/**
 * Add an item to the end of the user's current playback queue.
 *
 * @requires `user-modify-playback-state` \
 * **The user must have a Spotify Premium subscription.**
 *
 * @param client Spotify HTTPClient
 * @param uri The uri of the item to add to the queue. Must be a track or an episode uri.
 * @param deviceId The id of the device this command is targeting. If not supplied, the user's currently active device is the target.
 */
export function addItemToPlaybackQueue(
	client: HTTPClient,
	uri: string,
	deviceId?: string,
): Promise<Response> {
	return client.fetch("/v1/me/player/queue", {
		method: "POST",
		query: { uri, device_id: deviceId },
	});
}
