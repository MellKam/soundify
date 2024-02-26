import type { SimplifiedAlbum } from "../album/album.types.ts";
import type { Artist, SimplifiedArtist } from "../artist/artist.types.ts";
import type { ExternalIds, ExternalUrls } from "../general.types.ts";
import type { RequireAtLeastOne } from "../../shared.ts";

export interface LinkedTrack {
	/** @description Known external URLs for this track. */
	external_urls: ExternalUrls;
	/** @description A link to the Web API endpoint providing full details of the track. */
	href: string;
	/** @description The [Spotify ID](/documentation/web-api/concepts/spotify-uris-ids) for the track. */
	id: string;
	type: "track";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the track. */
	uri: string;
}

export type TrackRestriction = {
	/**
	 * @description The reason for the restriction. Supported values:
	 * - `market` - The content item is not available in the given market.
	 * - `product` - The content item is not available for the user's subscription type.
	 * - `explicit` - The content item is explicit and the user's account is set to not play explicit content.
	 *
	 * Additional reasons may be added in the future.
	 * **Note**: If you use this field, make sure that your application safely handles unknown values.
	 */
	// deno-lint-ignore ban-types
	reason?: "market" | "product" | "explicit" & (string & {});
};

export interface SimplifiedTrack {
	/**
	 * The artists who performed the track.
	 */
	artists: SimplifiedArtist[];
	/**
	 * A list of the countries in which the track can be played.
	 */
	available_markets?: string[];
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
	restrictions?: TrackRestriction;
	/**
	 * The number of the track. If an album has several discs, the track number is the number on the specified disc.
	 */
	track_number: number;
	/**
	 * The Spotify ID for the track.
	 */
	id: string;
	type: "track";
	/**
	 * The Spotify URI for the track.
	 */
	uri: string;
}

export interface Track extends SimplifiedTrack {
	/**
	 * The album on which the track appears.
	 */
	album: SimplifiedAlbum;
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

export interface AudioFeatures {
	/**
	 * Format: float
	 * @description A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.
	 *
	 * @example 0.00242
	 */
	acousticness: number;
	/**
	 * @description A URL to access the full audio analysis of this track. An access token is required to access this data.
	 *
	 * @example https://api.spotify.com/v1/audio-analysis/2takcwOaAZWiXQijPHIx7B
	 */
	analysis_url: string;
	/**
	 * Format: float
	 * @description Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.
	 *
	 * @example 0.585
	 */
	danceability: number;
	/**
	 * @description The duration of the track in milliseconds.
	 *
	 * @example 237040
	 */
	duration_ms: number;
	/**
	 * Format: float
	 * @description Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.
	 *
	 * @example 0.842
	 */
	energy: number;
	/**
	 * @description The Spotify ID for the track.
	 *
	 * @example 2takcwOaAZWiXQijPHIx7B
	 */
	id: string;
	/**
	 * Format: float
	 * @description Predicts whether a track contains no vocals. "Ooh" and "aah" sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly "vocal". The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.
	 *
	 * @example 0.00686
	 */
	instrumentalness: number;
	/**
	 * @description - The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on. If no key was detected, the value is -1.
	 *
	 * @example 9
	 */
	key: number;
	/**
	 * Format: float
	 * @description Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.
	 *
	 * @example 0.0866
	 */
	liveness: number;
	/**
	 * Format: float
	 *
	 * @description - The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typically range between -60 and 0 db.
	 *
	 * @example -5.883
	 */
	loudness: number;
	/**
	 * @description - Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.
	 *
	 * @example 0
	 */
	mode: number;
	/**
	 * Format: float
	 * @description Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.
	 *
	 * @example 0.0556
	 */
	speechiness: number;
	/**
	 * Format: float
	 * @description - The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
	 * @example 118.211
	 */
	tempo: number;
	/**
	 * @description - An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of "3/4", to "7/4".
	 *
	 * @example 4
	 */
	time_signature: number;
	/**
	 * @description A link to the Web API endpoint providing full details of the track.
	 *
	 * @example https://api.spotify.com/v1/tracks/2takcwOaAZWiXQijPHIx7B
	 */
	track_href: string;
	/**
	 * @description The object type.
	 */
	type: "audio_features";
	/**
	 * @description The Spotify URI for the track.
	 *
	 * @example spotify:track:2takcwOaAZWiXQijPHIx7B
	 */
	uri: string;
	/**
	 * Format: float
	 * @description A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).
	 *
	 * @example 0.428
	 */
	valence: number;
}

interface AudioAnalysisMeta {
	/**
	 * @description The version of the Analyzer used to analyze this track.
	 * @example 4.0.0
	 */
	analyzer_version: string;
	/**
	 * @description The platform used to read the track's audio data.
	 * @example Linux
	 */
	platform: string;
	/**
	 * @description A detailed status code for this track. If analysis data is missing, this code may explain why.
	 * @example OK
	 */
	detailed_status: string;
	/**
	 * @description The return code of the analyzer process. 0 if successful, 1 if any errors occurred.
	 * @example 0
	 */
	status_code: 0 | 1;
	/**
	 * @description The Unix timestamp (in seconds) at which this track was analyzed.
	 * @example 1495193577
	 */
	timestamp: number;
	/**
	 * @description The amount of time taken to analyze this track.
	 * @example 6.93906
	 */
	analysis_time: number;
	/**
	 * @description The method used to read the track's audio data.
	 * @example libvorbisfile L+R 44100->22050
	 */
	input_process: string;
}

interface AudioAnalysisTrack {
	/**
	 * @description The exact number of audio samples analyzed from this track. See also `analysis_sample_rate`.
	 * @example 4585515
	 */
	num_samples: number;
	/**
	 * @description Length of the track in seconds.
	 * @example 207.95985
	 */
	duration: number;
	/** @description This field will always contain the empty string. */
	sample_md5: "";
	/**
	 * @description An offset to the start of the region of the track that was analyzed. (As the entire track is analyzed, this should always be 0.)
	 * @example 0
	 */
	offset_seconds: number;
	/**
	 * @description The length of the region of the track was analyzed, if a subset of the track was analyzed. (As the entire track is analyzed, this should always be 0.)
	 * @example 0
	 */
	window_seconds: number;
	/**
	 * @description The sample rate used to decode and analyze this track. May differ from the actual sample rate of this track available on Spotify.
	 * @example 22050
	 */
	analysis_sample_rate: number;
	/**
	 * @description The number of channels used for analysis. If 1, all channels are summed together to mono before analysis.
	 * @example 1
	 */
	analysis_channels: number;
	/**
	 * @description The time, in seconds, at which the track's fade-in period ends. If the track has no fade-in, this will be 0.0.
	 * @example 0
	 */
	end_of_fade_in: number;
	/**
	 * @description The time, in seconds, at which the track's fade-out period starts. If the track has no fade-out, this should match the track's length.
	 * @example 201.13705
	 */
	start_of_fade_out: number;
	/**
	 * @description The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typically range between -60 and 0 db.
	 *
	 * @example -5.883
	 */
	loudness: number;
	/**
	 * @description - The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
	 * @example 118.211
	 */
	tempo: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `tempo`.
	 * @example 0.73
	 */
	tempo_confidence: number;
	/**
	 * @description - An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of "3/4", to "7/4".
	 * @example 4
	 */
	time_signature: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `time_signature`.
	 * @example 0.994
	 */
	time_signature_confidence: number;
	/**
	 * @description - The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on. If no key was detected, the value is -1.
	 *
	 * @example 9
	 */
	key: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `key`.
	 * @example 0.408
	 */
	key_confidence: number;
	/**
	 * @description - Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.
	 * @example 0
	 */
	mode: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `mode`.
	 * @example 0.485
	 */
	mode_confidence: number;
	/** @description An [Echo Nest Musical Fingerprint (ENMFP)](https://academiccommons.columbia.edu/doi/10.7916/D8Q248M4) codestring for this track. */
	codestring: string;
	/**
	 * @description A version number for the Echo Nest Musical Fingerprint format used in the codestring field.
	 * @example 3.15
	 */
	code_version: number;
	/** @description An [EchoPrint](https://github.com/spotify/echoprint-codegen) codestring for this track. */
	echoprintstring: string;
	/**
	 * @description A version number for the EchoPrint format used in the echoprintstring field.
	 * @example 4.15
	 */
	echoprint_version: number;
	/** @description A [Synchstring](https://github.com/echonest/synchdata) for this track. */
	synchstring: string;
	/**
	 * @description A version number for the Synchstring used in the synchstring field.
	 * @example 1
	 */
	synch_version: number;
	/** @description A Rhythmstring for this track. The format of this string is similar to the Synchstring. */
	rhythmstring: string;
	/**
	 * @description A version number for the Rhythmstring used in the rhythmstring field.
	 * @example 1
	 */
	rhythm_version: number;
}

interface TimeInterval {
	/**
	 * @description The starting point (in seconds) of the time interval.
	 * @example 0.49567
	 */
	start: number;
	/**
	 * @description The duration (in seconds) of the time interval.
	 * @example 2.18749
	 */
	duration: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the interval.
	 * @example 0.925
	 */
	confidence: number;
}

interface AudioAnalysisSection {
	/**
	 * @description The starting point (in seconds) of the section.
	 * @example 0
	 */
	start: number;
	/**
	 * @description The duration (in seconds) of the section.
	 * @example 6.97092
	 */
	duration: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the section's "designation".
	 * @example 1
	 */
	confidence: number;
	/**
	 * @description The overall loudness of the section in decibels (dB). Loudness values are useful for comparing relative loudness of sections within tracks.
	 * @example -14.938
	 */
	loudness: number;
	/**
	 * @description The overall estimated tempo of the section in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.
	 * @example 113.178
	 */
	tempo: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the tempo. Some tracks contain tempo changes or sounds which don't contain tempo (like pure speech) which would correspond to a low value in this field.
	 * @example 0.647
	 */
	tempo_confidence: number;
	/**
	 * @description The estimated overall key of the section. The values in this field ranging from 0 to 11 mapping to pitches using standard Pitch Class notation (E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on). If no key was detected, the value is -1.
	 * @example 9
	 */
	key: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the key. Songs with many key changes may correspond to low values in this field.
	 * @example 0.297
	 */
	key_confidence: number;
	/**
	 * @description Indicates the modality (major or minor) of a section, the type of scale from which its melodic content is derived. This field will contain a 0 for "minor", a 1 for "major", or a -1 for no result.
	 *
	 * Note that the major key (e.g. C major) could more likely be confused with the minor key at 3 semitones lower (e.g. A minor) as both keys carry the same pitches.
	 */
	mode: -1 | 0 | 1;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `mode`.
	 * @example 0.471
	 */
	mode_confidence: number;
	/**
	 * @description - An estimated time signature. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure). The time signature ranges from 3 to 7 indicating time signatures of "3/4", to "7/4".
	 *
	 * @example 4
	 */
	time_signature: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the `time_signature`. Sections with time signature changes may correspond to low values in this field.
	 * @example 1
	 */
	time_signature_confidence: number;
}

interface AudioAnalysisSegment {
	/**
	 * @description The starting point (in seconds) of the segment.
	 * @example 0.70154
	 */
	start: number;
	/**
	 * @description The duration (in seconds) of the segment.
	 * @example 0.19891
	 */
	duration: number;
	/**
	 * @description The confidence, from 0.0 to 1.0, of the reliability of the segmentation. Segments of the song which are difficult to logically segment (e.g: noise) may correspond to low values in this field.
	 *
	 * @example 0.435
	 */
	confidence: number;
	/**
	 * @description The onset loudness of the segment in decibels (dB). Combined with `loudness_max` and `loudness_max_time`, these components can be used to describe the "attack" of the segment.
	 * @example -23.053
	 */
	loudness_start: number;
	/**
	 * @description The peak loudness of the segment in decibels (dB). Combined with `loudness_start` and `loudness_max_time`, these components can be used to describe the "attack" of the segment.
	 * @example -14.25
	 */
	loudness_max: number;
	/**
	 * @description The segment-relative offset of the segment peak loudness in seconds. Combined with `loudness_start` and `loudness_max`, these components can be used to desctibe the "attack" of the segment.
	 * @example 0.07305
	 */
	loudness_max_time: number;
	/**
	 * @description The offset loudness of the segment in decibels (dB). This value should be equivalent to the loudness_start of the following segment.
	 * @example 0
	 */
	loudness_end: number;
	/**
	 * @description Pitch content is given by a “chroma” vector, corresponding to the 12 pitch classes C, C#, D to B, with values ranging from 0 to 1 that describe the relative dominance of every pitch in the chromatic scale. For example a C Major chord would likely be represented by large values of C, E and G (i.e. classes 0, 4, and 7).
	 *
	 * Vectors are normalized to 1 by their strongest dimension, therefore noisy sounds are likely represented by values that are all close to 1, while pure tones are described by one value at 1 (the pitch) and others near 0.
	 * As can be seen below, the 12 vector indices are a combination of low-power spectrum values at their respective pitch frequencies.
	 *
	 * ![pitch vector](https://developer.spotify.com/assets/audio/Pitch_vector.png)
	 *
	 * @example [0.212, 0.141, 0.294]
	 */
	pitches: number[];
	/**
	 * @description Timbre is the quality of a musical note or sound that distinguishes different types of musical instruments, or voices. It is a complex notion also referred to as sound color, texture, or tone quality, and is derived from the shape of a segment’s spectro-temporal surface, independently of pitch and loudness. The timbre feature is a vector that includes 12 unbounded values roughly centered around 0. Those values are high level abstractions of the spectral surface, ordered by degree of importance.
	 *
	 * For completeness however, the first dimension represents the average loudness of the segment; second emphasizes brightness; third is more closely correlated to the flatness of a sound; fourth to sounds with a stronger attack; etc. See an image below representing the 12 basis functions (i.e. template segments).
	 * ![timbre basis functions](https://developer.spotify.com/assets/audio/Timbre_basis_functions.png)
	 *
	 * The actual timbre of the segment is best described as a linear combination of these 12 basis functions weighted by the coefficient values: timbre = c1 x b1 + c2 x b2 + ... + c12 x b12, where c1 to c12 represent the 12 coefficients and b1 to b12 the 12 basis functions as displayed below. Timbre vectors are best used in comparison with each other.
	 *
	 * @example [42.115, 64.373, -0.233]
	 */
	timbre: number[];
}

export interface AudioAnalysis {
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
}

type RecommendationRequiredOptions = {
	/**
	 * List of Spotify IDs for seed artists.
	 * Up to 5 seed values may be provided in any combination of `seed_artists`, `seed_tracks` and `seed_genres`.
	 */
	seed_artists: string[];
	/**
	 * List of any genres in the set of available genre seeds.
	 * Up to 5 seed values may be provided in any combination of `seed_artists`, `seed_tracks` and `seed_genres`.
	 */
	seed_genres: string[];
	/**
	 * A comma separated list of Spotify IDs for a seed track.
	 * Up to 5 seed values may be provided in any combination of `seed_artists`, `seed_tracks` and `seed_genres`.
	 */
	seed_tracks: string[];
};

export type RecommendationsOptions =
	& RequireAtLeastOne<RecommendationRequiredOptions>
	& {
		/**
		 * The target size of the list of recommended tracks.
		 * Minimum: 1. Maximum: 100. Default: 20.
		 */
		limit?: number;
		/**
		 * An ISO 3166-1 alpha-2 country code
		 */
		// deno-lint-ignore ban-types
		market?: (string & {}) | "from_token";
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

export interface RecommendationSeed {
	/** @description The number of tracks available after min\_\* and max\_\* filters have been applied. */
	afterFilteringSize: number;
	/** @description The number of tracks available after relinking for regional availability. */
	afterRelinkingSize: number;
	/** @description A link to the full track or artist data for this seed. For tracks this will be a link to a Track Object. For artists a link to an Artist Object. For genre seeds, this value will be `null`. */
	href: string | null;
	/** @description The id used to select this seed. This will be the same as the string used in the `seed_artists`, `seed_tracks` or `seed_genres` parameter. */
	id: string;
	/** @description The number of recommended tracks available for this seed. */
	initialPoolSize: number;
	/** @description The entity type of this seed. One of `artist`, `track` or `genre`. */
	type: "artist" | "track" | "genre";
}

export type Recomendations = {
	seeds: RecommendationSeed[];
	/**
	 * An array of track object ordered according to the parameters supplied.
	 */
	tracks: Track[];
};
