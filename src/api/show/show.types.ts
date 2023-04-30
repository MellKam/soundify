import { JSONObject } from "../../shared";
import { EpisodeSimplified } from "../episode/episode.types";
import { Copyright, ExternalUrls, Image, PagingObject } from "../general.types";
import { Market } from "../market/market.types";

export interface ShowSimplified extends JSONObject {
  available_markets: Market[];
  copyrights: Copyright[];
  description: string;
  html_description: string;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  type: string;
  url: string;
  total_episodes: number;
}

export interface Show extends ShowSimplified, JSONObject {
  episodes: PagingObject<EpisodeSimplified>;
}
