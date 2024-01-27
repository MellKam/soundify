import type { Episode } from "../episode/episode.types.ts";
import type { ExternalUrls } from "../general.types.ts";
import type { Track } from "../track/track.types.ts";

export type Device = {
	/**
	 * The device ID. This ID is unique and persistent to some extent. However, this is not guaranteed and any cached device_id should periodically be cleared out and refetched as necessary.
	 */
	id: string | null;
	/** If this device is the currently active device. */
	is_active: boolean;
	/** If this device is currently in a private session. */
	is_private_session: boolean;
	/**
	 * Whether controlling this device is restricted. At present if this is "true" then no Web API commands will be accepted by this device.
	 */
	is_restricted: boolean;
	/**
	 * A human-readable name for the device. Some devices have a name that the user can configure (e.g. "Loudest speaker") and some devices have a generic name associated with the manufacturer or device model.
	 */
	name: string;
	/**
	 * Device type, such as "computer", "smartphone" or "speaker". */
	type: "computer" | "smartphone" | "speaker";
	/**
	 * The current volume in percent.
	 * Range: 0 - 100
	 */
	volume_percent: number | null;
	/**
	 * If this device can be used to set the volume.
	 */
	supports_volume: boolean;
};

export type Actions = {
	/** Interrupting playback. */
	interrupting_playback?: boolean;
	/** Pausing. */
	pausing?: boolean;
	/** Resuming. */
	resuming?: boolean;
	/** Seeking playback location. */
	seeking?: boolean;
	/** Skipping to the next context. */
	skipping_next?: boolean;
	/** Skipping to the previous context. */
	skipping_prev?: boolean;
	/** Toggling repeat context flag. */
	toggling_repeat_context?: boolean;
	/** Toggling shuffle flag. */
	toggling_shuffle?: boolean;
	/** Toggling repeat track flag. */
	toggling_repeat_track?: boolean;
	/** Transfering playback between devices. */
	transferring_playback?: boolean;
};

export type Context = {
	/**
	 * The object type, e.g. "artist", "playlist", "album", "show".
	 */
	type: string;
	/** A link to the Web API endpoint providing full details of the track. */
	href: string;
	/** External URLs for this context. */
	external_urls: ExternalUrls;
	/** The Spotify URI for the context. */
	uri: string;
};

export type PlaybackState = {
	/** The device that is currently active. */
	device: Device;
	repeat_state: "off" | "track" | "context";
	/** If shuffle is on or off. */
	shuffle_state: boolean;
	context: Context | null;
	/** Unix Millisecond Timestamp when data was fetched. */
	timestamp: number;
	/** Progress into the currently playing track or episode. */
	progress_ms: number | null;
	/** If something is currently playing, return true. */
	is_playing: boolean;
	item: Track | Episode;
	/** The object type of the currently playing item. */
	currently_playing_type: "track" | "episode" | "ad" | "unknown";
	/**
	 * Allows to update the user interface based on which playback actions are available within the current context.
	 */
	actions: Actions;
};

export type Queue = {
	/** The currently playing track or episode. */
	currently_playing: Track | Episode | null;
	/** The tracks or episodes in the queue. Can be empty. */
	queue: (Track | Episode)[];
};

export type PlayHistoryObject = {
	/** The track the user listened to. */
	track: Track;
	/** The date and time the track was played. */
	played_at: string;
	/** The context the track was played from. */
	context: Context;
};
