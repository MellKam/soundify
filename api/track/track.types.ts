import { AlbumSimplified } from "../album/index.ts";
import { Artist } from "../artist/index.ts";
import {
	ExternalIds,
	ExternalUrls,
	Market,
	RestrictionsReason,
} from "../shared/index.ts";

export interface Track {
	/**
	 * The album on which the track appears.
	 */
	album: AlbumSimplified;
	/**
	 * The artists who performed the track.
	 */
	artists: Artist[];
	/**
	 * The markets in which the album is available:
	 * ISO 3166-1 alpha-2 country codes.
	 */
	available_markets: Market[];
	/**
	 * The disc number
	 * (usually 1 unless the album consists of more than one disc).
	 */
	disc_number: number;
	/**
	 * The track length in milliseconds.
	 */
	duration_ms: number;
	/**
	 * Whether or not the track has explicit lyrics.
	 */
	explicit: boolean;
	/**
	 * Known external IDs for the track.
	 */
	external_ids: ExternalIds;
	/**
	 * Known external URLs for this track.
	 */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the track.
	 */
	href: string;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	/**
	 * If true, the track is playable in the given market.
	 * Otherwise false.
	 */
	is_playable?: boolean;
	// TODO linked_from: {};
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: {
		reason: RestrictionsReason;
	};
	/**
	 * Name of the track.
	 */
	name: string;
	/**
	 * The popularity of the track.
	 * The value will be between 0 and 100, with 100 being the most popular.
	 */
	popularity: number;
	/**
	 * A link to a 30 second preview (MP3 format) of the track.
	 */
	preview_url: string | null;
	/**
	 * The number of the track. If an album has several discs, the track number is the number on the specified disc.
	 */
	track_number: number;
	/**
	 * The object type: "track".
	 */
	type: "track";
	/**
	 * The Spotify URI for the track.
	 */
	uri: `spotify:track:${string}`;
	/**
	 * Whether or not the track is from a local file.
	 */
	is_local: boolean;
}

export interface AudioFeatures {
	/**
	 * A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.
	 */
	acousticness: number;
	/**
	 * A URL to access the full audio analysis of this track. An access token is required to access this data.
	 */
	analysis_url: string;
	/**
	 * Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.
	 * A value of 0.0 is least danceable and 1.0 is most danceable.
	 */
	danceability: number;
	/**
	 * The duration of the track in milliseconds.
	 */
	duration_ms: number;
	/**
	 * Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity.
	 * Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale.
	 * Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.
	 */
	energy: number;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	/**
	 * Predicts whether a track contains no vocals. "Ooh" and "aah" sounds are treated as instrumental in this context.
	 * Rap or spoken word tracks are clearly "vocal". The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content.
	 * Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.
	 */
	instrumentalness: number;
	/**
	 * The key the track is in. Integers map to pitches using standard Pitch Class notation.
	 * E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.
	 */
	key: number;
	/**
	 * Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live.
	 * A value above 0.8 provides strong likelihood that the track is live.
	 */
	liveness: number;
	/**
	 * The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks.
	 * Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.
	 */
	loudness: number;
	/**
	 * Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived.
	 * Major is represented by 1 and minor is 0.
	 */
	mode: number;
	/**
	 * Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. Talk show, audio book, poetry), the closer to 1.0 the attribute value.
	 * Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music.
	 * Values below 0.33 most likely represent music and other non-speech-like tracks.
	 */
	speechiness: number;
	/**
	 * The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
	 */
	tempo: number;
	/**
	 * An estimated overall time signature of a track. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).
	 */
	time_signature: number;
	/**
	 * A link to the Web API endpoint providing full details of the track.
	 */
	track_href: string;
	/**
	 * The object type.
	 */
	type: "audio_features";
	/**
	 * The Spotify URI for the track.
	 */
	uri: `spotify:track:${string}`;
	/**
	 * A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. Happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. Sad, depressed, angry).
	 */
	valence: number;
}
