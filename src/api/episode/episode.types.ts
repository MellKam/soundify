import { JSONObject } from "../../shared";
import {
  ExternalUrls,
  Image,
  RestrictionsReason,
  ResumePoint
} from "../general.types";
import { Show } from "../show/show.types";

export interface EpisodeSimplified extends JSONObject {
  /**
   * A URL to a 30 second preview (MP3 format).
   */
  audio_preview_url: string;
  /**
   * A description of the episode without HTML tags.
   */
  description: string;
  /**
   * A description of the episode with HTML tags.
   */
  html_description: string;
  /**
   * The episode length in milliseconds.
   */
  duration_ms: number;
  /**
   * Whether or not the episode has explicit lyrics.
   */
  explicit: boolean;
  /**
   * External URLs for this episode.
   */
  external_urls: ExternalUrls;
  /**
   * A link to the Web API endpoint providing full details of the episode.
   */
  href: string;
  /**
   * The Spotify ID for the episode.
   */
  id: string;
  /**
   * Images of the episode in various sizes, widest first.
   */
  images: Image[];
  /**
   * True, if the episode is hosted outside of Spotify's CDN.
   */
  is_externally_hosted: boolean;
  /**
   * If true, the episode is playable in the given market.
   * Otherwise false.
   */
  is_playable: boolean;
  /**
   * The language used in the episode. Identified by a ISO 639 code. Deprecated.
   */
  language?: string;
  /**
   * A list of the languages used in the episode, identified by their ISO 639-1 code.
   */
  languages: string[];
  /**
   * The name of the episode.
   */
  name: string;
  /**
   * The date the episode was first released.
   * Depending on the precision it might be shown in different ways
   */
  release_date: string;
  /**
   * The precision with which `release_date` value is known.
   */
  release_date_precision: "year" | "month" | "day";
  /**
   * The user's most recent position in the episode.
   */
  resume_point: ResumePoint;
  /**
   * The object type.
   */
  type: "episode";
  /**
   * The Spotify URI for the episode.
   */
  url: string;
  /**
   * Included in the response when a content restriction is applied.
   */
  restrictions?: {
    /**
     * The reason for the restriction.
     *
     * Episodes may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content.
     */
    reason: RestrictionsReason;
  };
}

export interface Episode extends EpisodeSimplified, JSONObject {
  /**
   * The show on which episode belongs.
   */
  show: Show;
}
