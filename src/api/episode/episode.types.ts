import {JSONObject} from "../../shared";
import {Copyright, ExternalUrls, Image, RestrictionsReason, ResumePoint} from "../general.types";
import {Market} from "../market/market.types";


interface EpisodeBase extends JSONObject {
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
    }
}

interface Show extends JSONObject {
    available_markets: Market[];
    copyrights: Copyright[];
    description: string;
    html_description: string;
    explicit: boolean;
    external_urls: ExternalUrls;
    href: string
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

export interface Episode extends EpisodeBase, JSONObject {
    show: Show;
}