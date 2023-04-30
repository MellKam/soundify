import {HTTPClient} from "../client";
import {Market} from "../market/market.types";
import {Episode} from "../episode/episode.types"
import {PagingObject, PagingOptions} from "../general.types";

export const getEpisode = async (
    client: HTTPClient,
    episode_id: string,
    market?: Market
) => {
    return await client.fetch<Episode>("/episodes/" + episode_id, "json", {
        query: {market}
    });
};

export const getEpisodes = async (
    client: HTTPClient,
    episodes_ids: string[],
    market?: Market
) => {
    return (
        await client.fetch<{episodes: Episode[]}>("/episodes", "json", {
            query: {market, ids: episodes_ids}
        })
    ).episodes
}

export interface GetSavedEpisodesOpts extends PagingOptions {
    market?: Market;
}

export const getSavedEpisodes = async (
    client: HTTPClient,
    opts?: GetSavedEpisodesOpts
) => {
    return await client.fetch<
        PagingObject<{
            added_at: string;
            episode: Episode
        }>
    >("/me/episodes", "json", {
        query: opts
    });
};

export const saveEpisodes = async (client: HTTPClient, episodes_ids: string[]) => {
    await client.fetch("/me/episodes", "void", {
        method: "PUT",
        query: {ids: episodes_ids}
    });
};

export const saveEpisode = async (client: HTTPClient, episode_id: string) => {
    await saveEpisodes(client, [episode_id])EEE
}