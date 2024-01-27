import type { Prettify } from "../shared.ts";
import type { AlbumSimplified } from "../album/album.types.ts";
import type { Artist } from "../artist/artist.types.ts";
import type { ArtistSimplified } from "../artist/artist.types.ts";
import type {
	ExternalIds,
	ExternalUrls,
	RestrictionsReason,
} from "../general.types.ts";

export type LinkedTrack = {
	/**
	 * A map of url name and the url.
	 */
	external_urls: ExternalUrls;
	/**
	 * The api url where you can get the full details of the linked track.
	 */
	href: string;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	/**
	 * The object type: "track".
	 */
	type: "track";
	/**
	 * The Spotify URI for the track.
	 */
	uri: string;
};

export type TrackSimplified = {
	/**
	 * The artists who performed the track.
	 */
	artists: ArtistSimplified[];
	/**
	 * A list of the countries in which the track can be played.
	 */
	available_markets: string[];
	/**
	 * The disc number (usually 1 unless the album consists of more than one disc).
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
	/** External URLs for this track. */
	external_urls: ExternalUrls;
	/**
	 * A link to the Web API endpoint providing full details of the track.
	 */
	href: string;
	/**
	 * Whether or not the track is from a local file.
	 */
	is_local: boolean;
	/**
	 * If true, the track is playable in the given market.
	 * Otherwise false.
	 */
	is_playable?: boolean;
	/**
	 * Part of the response when Track Relinking is applied and is only part of the response if the track linking, in fact, exists.
	 */
	linked_from?: LinkedTrack;
	/**
	 * The name of the track.
	 */
	name: string;
	/**
	 * A link to a 30 second preview (MP3 format) of the track.
	 */
	preview_url: string | null;
	/**
	 * Included in the response when a content restriction is applied.
	 */
	restrictions?: {
		reason: RestrictionsReason;
	};
	/**
	 * The number of the track. If an album has several discs, the track number is the number on the specified disc.
	 */
	track_number: number;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	/**
	 * The object type: "track".
	 */
	type: "track";
	/**
	 * The Spotify URI for the track.
	 */
	uri: string;
};

export type Track = Prettify<
	Omit<TrackSimplified, "artists"> & {
		/**
		 * The album on which the track appears.
		 */
		album: AlbumSimplified;
		/**
		 * The artists who performed the track.
		 */
		artists: Artist[];
		/**
		 * Known external IDs for the track.
		 */
		external_ids: ExternalIds;
		/**
		 * The popularity of the track.
		 * The value will be between 0 and 100, with 100 being the most popular.
		 */
		popularity: number;
	}
>;

export type AudioFeatures = {
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
	uri: string;
	/**
	 * A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. Happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. Sad, depressed, angry).
	 */
	valence: number;
};

type AudioAnalysisMeta = {
	/**
	 * The version of the Analyzer used to analyze this track.
	 */
	analyzer_version: string;
	/**
	 * The platform used to read the track's audio data.
	 */
	platform: string;
	/**
	 * A detailed status code for this track. If analysis data is missing, this code may explain why.
	 */
	detailed_status: string;
	/**
	 * The return code of the analyzer process.
	 * 0 if successful, 1 if any errors occurred.
	 */
	status_code: 0 | 1;
	/**
	 * The Unix timestamp (in seconds) at which this track was analyzed.
	 */
	timestamp: number;
	/**
	 * The amount of time taken to analyze this track.
	 */
	analysis_time: number;
	/**
	 * The method used to read the track's audio data.
	 */
	input_process: string;
};

type AudioAnalysisTrack = {
	/**
	 * The exact number of audio samples analyzed from this track.
	 */
	num_samples: number;
	/**
	 * Length of the track in seconds.
	 */
	duration: number;
	/**
	 * This field will always contain the empty string.
	 */
	sample_md5: "";
	/**
	 * An offset to the start of the region of the track that was analyzed.
	 * (As the entire track is analyzed, this should always be 0.)
	 */
	offset_seconds: number;
	/**
	 * The length of the region of the track was analyzed, if a subset of the track was analyzed.
	 * (As the entire track is analyzed, this should always be 0.)
	 */
	window_seconds: number;
	/**
	 * The sample rate used to decode and analyze this track.
	 * May differ from the actual sample rate of this track available on Spotify.
	 */
	analysis_sample_rate: number;
	/**
	 * The number of channels used for analysis.
	 * If 1, all channels are summed together to mono before analysis.
	 */
	analysis_channels: number;
	/**
	 * The time, in seconds, at which the track's fade-in period ends.
	 * If the track has no fade-in, this will be 0.0.
	 */
	end_of_fade_in: number;
	/**
	 * The time, in seconds, at which the track's fade-out period starts.
	 * If the track has no fade-out, this should match the track's length.
	 */
	start_of_fade_out: number;
	/**
	 * The overall loudness of a track in decibels (dB).
	 * Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude).
	 *
	 * Values typically range between -60 and 0 db.
	 */
	loudness: number;
	/**
	 * The overall estimated tempo of a track in beats per minute (BPM).
	 * In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
	 */
	tempo: number;
	/**
	 * The confidence, from 0.0 to 1.0, of the reliability of the `tempo`.
	 */
	tempo_confidence: number;
	/**
	 * An estimated time signature.
	 * The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of "3/4", to "7/4".
	 */
	time_signature: number;
	/**
	 * The confidence, from 0.0 to 1.0, of the reliability of the `time_signature`.
	 */
	time_signature_confidence: number;
	/**
	 * The key the track is in.
	 * Integers map to pitches using standard Pitch Class notation.
	 * E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.
	 * If no key was detected, the value is -1.
	 */
	key: number;
	/**
	 * The confidence, from 0.0 to 1.0, of the reliability of the `key`.
	 */
	key_confidence: number;
	/**
	 * Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived.
	 * Major is represented by 1 and minor is 0.
	 */
	mode: number;
	/**
	 * The confidence, from 0.0 to 1.0, of the reliability of the `mode`.
	 */
	mode_confidence: number;
	/**
	 * An Echo Nest Musical Fingerprint (ENMFP) codestring for this track.
	 */
	codestring: string;
	/**
	 * A version number for the Echo Nest Musical Fingerprint format used in the codestring field.
	 */
	code_version: number;
	/**
	 * An EchoPrint codestring for this track.
	 */
	echoprintstring: string;
	/**
	 * A version number for the EchoPrint format used in the echoprintstring field.
	 */
	echoprint_version: number;
	/**
	 * A Synchstring for this track.
	 */
	synchstring: string;
	/**
	 * A version number for the Synchstring used in the synchstring field.
	 */
	synch_version: number;
	/**
	 * A Rhythmstring for this track.
	 * The format of this string is similar to the Synchstring.
	 */
	rhythmstring: string;
	/**
	 * A version number for the Rhythmstring used in the rhythmstring field.
	 */
	rhythm_version: number;
};

type TimeInterval = {
	/**
	 * The starting point (in seconds) of the time interval.
	 */
	start: number;
	/**
	 * The duration (in seconds) of the time interval.
	 */
	duration: number;
	/**
	 * The confidence, from 0.0 to 1.0, of the reliability of the interval.
	 */
	confidence: number;
};

type AudioAnalysisSection = Prettify<
	TimeInterval & {
		/**
		 * The overall loudness of the section in decibels (dB).
		 * Loudness values are useful for comparing relative loudness of sections within tracks.
		 */
		loudness: number;
		/**
		 * The overall estimated tempo of the section in beats per minute (BPM).
		 * In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
		 */
		tempo: number;
		/**
		 * The confidence, from 0.0 to 1.0, of the reliability of the `tempo`.
		 * Some tracks contain tempo changes or sounds which don't contain tempo (like pure speech) which would correspond to a low value in this field.
		 */
		tempo_confidence: number;
		/**
		 * The estimated overall key of the section.
		 * The values in this field ranging from 0 to 11 mapping to pitches using standard Pitch Class notation
		 * (E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on).
		 * If no key was detected, the value is -1.
		 */
		key: number;
		/**
		 * The confidence, from 0.0 to 1.0, of the reliability of the `key`.
		 * Songs with many key changes may correspond to low values in this field.
		 */
		key_confidence: number;
		/**
		 * Indicates the modality (major or minor) of a section, the type of scale from which its melodic content is derived.
		 * This field will contain a 0 for "minor", a 1 for "major", or a -1 for no result.
		 */
		mode: number;
		/**
		 * The confidence, from 0.0 to 1.0, of the reliability of the `mode`.
		 */
		mode_confidence: number;
		/**
		 * An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).
		 * The time signature ranges from 3 to 7 indicating time signatures of "3/4", to "7/4".
		 */
		time_signature: number;
		/**
		 * The confidence, from 0.0 to 1.0, of the reliability of the time_signature.
		 * Sections with time signature changes may correspond to low values in this field.
		 */
		time_signature_confidence: number;
	}
>;

type AudioAnalysisSegment = Prettify<
	TimeInterval & {
		/**
		 * The onset loudness of the segment in decibels (dB).
		 */
		loudness_start: number;
		/**
		 * The peak loudness of the segment in decibels (dB).
		 */
		loudness_max_time: number;
		/**
		 * The segment-relative offset of the segment peak loudness in seconds.
		 */
		loudness_max: number;
		/**
		 * The offset loudness of the segment in decibels (dB). This value should be equivalent to the loudness_start of the following segment.
		 */
		loudness_end: number;
		/**
		 * Pitch content is given by a “chroma” vector, corresponding to the 12 pitch classes C, C#, D to B, with values ranging from 0 to 1 that describe the relative dominance of every pitch in the chromatic scale.
		 */
		pitches: number[];
		/**
		 * Timbre is the quality of a musical note or sound that distinguishes different types of musical instruments, or voices.
		 * It is a complex notion also referred to as sound color, texture, or tone quality, and is derived from the shape of a segment’s spectro-temporal surface, independently of pitch and loudness.
		 */
		timbre: number[];
	}
>;

export type AudioAnalysis = {
	meta: AudioAnalysisMeta;
	track: AudioAnalysisTrack;
	/**
	 * The time intervals of the bars throughout the track.
	 * A bar (or measure) is a segment of time defined as a given number of beats.
	 */
	bars: TimeInterval[];
	/**
	 * The time intervals of beats throughout the track.
	 * A beat is the basic time unit of a piece of music; for example, each tick of a metronome. Beats are typically multiples of tatums.
	 */
	beats: TimeInterval[];
	/**
	 * Sections are defined by large variations in rhythm or timbre, e.g. chorus, verse, bridge, guitar solo, etc. Each section contains its own descriptions of `tempo`, `key`, `mode`, `time_signature`, and `loudness`.
	 */
	sections: AudioAnalysisSection[];
	/**
	 * Each segment contains a roughly conisistent sound throughout its duration.
	 */
	segments: AudioAnalysisSegment[];
	/**
	 * A tatum represents the lowest regular pulse train that a listener intuitively infers from the timing of perceived musical events (segments).
	 */
	tatums: TimeInterval[];
};

export type GetRecommendationsOpts = {
	/**
	 * List of Spotify IDs for seed artists. Maximum 5 IDs
	 */
	seed_artists: string[];
	/**
	 * List of any genres in the set of available genre seeds. Maximum 5 genres
	 */
	seed_genres: string[];
	/**
	 * List of Spotify IDs for a seed track. Maximum 5 IDs
	 */
	seed_tracks: string[];
	/**
	 * The target size of the list of recommended tracks.
	 * Minimum: 1. Maximum: 100. Default: 20.
	 */
	limit?: number;
	/**
	 * An ISO 3166-1 alpha-2 country code
	 */
	market?: string;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_acousticness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_danceability?: number;
	max_duration_ms?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_energy?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_instrumentalness?: number;
	/**
	 * Range: `>= 0 <= 11`
	 */
	max_key?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_liveness?: number;
	max_loudness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_mode?: number;
	/**
	 * Range `>= 0 <= 100`
	 */
	max_popularity?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_speechiness?: number;
	max_tempo?: number;
	max_time_signature?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	max_valence?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_acousticness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_danceability?: number;
	min_duration_ms?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_energy?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_instrumentalness?: number;
	/**
	 * Range: `>= 0 <= 11`
	 */
	min_key?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_liveness?: number;
	min_loudness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_mode?: number;
	/**
	 * Range `>= 0 <= 100`
	 */
	min_popularity?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_speechiness?: number;
	min_tempo?: number;
	/**
	 * Range `<= 11`
	 */
	min_time_signature?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	min_valence?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_acousticness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_danceability?: number;
	/**
	 * Target duration of the track (ms)
	 */
	target_duration_ms?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_energy?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_instrumentalness?: number;
	/**
	 * Range: `>= 0 <= 11`
	 */
	target_key?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_liveness?: number;
	target_loudness?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_mode?: number;
	/**
	 * Range `>= 0 <= 100`
	 */
	target_popularity?: number;
	target_speechiness?: number;
	/**
	 * Target tempo (BPM)
	 */
	target_tempo?: number;
	target_time_signature?: number;
	/**
	 * Range: `>= 0 <= 1`
	 */
	target_valence?: number;
};

export type RecommendationSeed = {
	/**
	 * The number of tracks available after min_* and max_* filters have been applied.
	 */
	afterFilteringSize: number;
	/**
	 * The number of tracks available after relinking for regional availability.
	 */
	afterRelinkingSize: number;
	/**
	 * A link to the full track or artist data for this seed.
	 *
	 * For tracks this will be a link to a Track Object.  \
	 * For artists a link to an Artist Object. \
	 * For genre seeds, this value will be null.
	 */
	href: string | null;
	/**
	 * The id used to select this seed. This will be the same as the string used in the `seed_artists`, `seed_tracks` or `seed_genres` parameter.
	 */
	id: string;
	/**
	 * The number of recommended tracks available for this seed.
	 */
	initialPoolSize: number;
	/**
	 * The entity type of this seed.
	 */
	type: "artist" | "track" | "genre";
};

export type Recomendations = {
	/**
	 * An array of recommendation seed objects.
	 */
	seeds: RecommendationSeed[];
	/**
	 * An array of track object (simplified) ordered according to the parameters supplied.
	 */
	tracks: TrackSimplified[];
};
