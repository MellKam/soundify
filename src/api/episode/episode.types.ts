import { JSONObject } from "../../shared";
import {
  Copyright,
  ExternalUrls,
  Image,
  RestrictionsReason,
  ResumePoint
} from "../general.types";
import { Show } from "../show/show.types";

export interface EpisodeSimplified extends JSONObject {
  audio_preview_url: string;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language?: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: ResumePoint;
  type: "episode";
  url: string;
  restrictions?: {
    reason: RestrictionsReason;
  };
}

export interface Episode extends EpisodeSimplified, JSONObject {
  show: Show;
}
