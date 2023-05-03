import { Artist } from "../artist/artist.types";
import { Track } from "../track/track.types";
import { UserPrivate, UserPublic } from "../user/user.types";
import {
  CursorPagingObject,
  PagingObject,
  PagingOptions
} from "../general.types";
import { SearchParams } from "../../shared";
import { HTTPClient } from "../client";

/**
 * Get detailed profile information about the current user.
 *
 * @param client Spotify HTTPClient
 */
export const getCurrentUser = async (client: HTTPClient) => {
  return await client.fetch<UserPrivate>("/me", "json");
};

export type GetUserTopItemsOpts = {
  /**
   * Over what time frame the affinities are computed.
   *
   * "long_term" => calculated from several years of data \
   * "medium_term" => approximately last 6 months) \
   * "short_term" => approximately last 4 weeks
   *
   * @default "medium_term"
   */
  time_range?: "long_term" | "medium_term" | "short_term";
} & PagingOptions;

export type UserTopItemType = "artists" | "tracks";
export type UserTopItem = Artist | Track;
interface UserTopItemMap extends Record<UserTopItemType, UserTopItem> {
  artists: Artist;
  tracks: Track;
}

/**
 * Get the current user's top artists or tracks
 * based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param type The type of entity to return. ("artists" or "tracks")
 * @param opts Additional option for request
 */
export const getUserTopItems = async <T extends UserTopItemType>(
  client: HTTPClient,
  type: T,
  opts?: GetUserTopItemsOpts
) => {
  return await client.fetch<PagingObject<UserTopItemMap[T]>>(
    "/me/top/" + type,
    "json",
    {
      query: opts
    }
  );
};

export type UserTopItemsEndpoint = {
  getUserTopItems: <T extends UserTopItemType>(
    type: T,
    opts?: GetUserTopItemsOpts
  ) => Promise<PagingObject<UserTopItemMap[T]>>;
};

/**
 * Get the current user's top artists based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getUserTopArtists = async (
  client: HTTPClient,
  opts: GetUserTopItemsOpts
) => {
  return await getUserTopItems(client, "artists", opts);
};

/**
 * Get the current user's top tracks based on calculated affinity.
 *
 * @requires `user-top-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getUserTopTracks = async (
  client: HTTPClient,
  opts: GetUserTopItemsOpts
) => {
  return await getUserTopItems(client, "tracks", opts);
};

/**
 * Get public profile information about a Spotify user.
 *
 * @param client Spotify HTTPClient
 * @param user_id Spotify user ID
 */
export const getUser = async (client: HTTPClient, user_id: string) => {
  return await client.fetch<UserPublic>("/users/" + user_id, "json");
};

/**
 * Add the current user as a follower of a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlist_id Spotify playlist ID
 * @param is_public If true the playlist will be included in user's public
 * playlists, if false it will remain private. By default - true
 */
export const followPlaylist = async (
  client: HTTPClient,
  playlist_id: string,
  is_public?: boolean
) => {
  await client.fetch(`/playlists/${playlist_id}/followers`, "void", {
    method: "PUT",
    json: { public: is_public }
  });
};

/**
 * Remove the current user as a follower of a playlist.
 *
 * @requires `playlist-modify-public` or `playlist-modify-private`
 *
 * @param client Spotify HTTPClient
 * @param playlist_id Spotify playlist ID
 */
export const unfollowPlaylist = async (
  client: HTTPClient,
  playlist_id: string
) => {
  await client.fetch(`/playlists/${playlist_id}/followers`, "void", {
    method: "DELETE"
  });
};

export interface GetFollowedArtistsOpts
  extends SearchParams,
    Pick<PagingOptions, "limit"> {
  /**
   * The last artist ID retrieved from the previous request.
   */
  after?: string;
}

/**
 * Get the current user's followed artists.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param opts Additional option for request
 */
export const getFollowedArtists = async (
  client: HTTPClient,
  opts?: GetFollowedArtistsOpts
) => {
  return (
    await client.fetch<{ artists: CursorPagingObject<Artist> }>(
      "/me/following",
      "json",
      {
        query: {
          ...opts,
          type: "artist"
        }
      }
    )
  ).artists;
};

/**
 * Add the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_ids List of Spotify artist IDs. Maximum 50
 */
export const followArtists = async (
  client: HTTPClient,
  artist_ids: string[]
) => {
  await client.fetch("/me/following", "void", {
    method: "PUT",
    query: {
      type: "artist",
      ids: artist_ids
    }
  });
};

/**
 * Add the current user as a follower of an artist.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const followArtist = async (client: HTTPClient, artist_id: string) => {
  return await followArtists(client, [artist_id]);
};

/**
 * Add the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_ids List of Spotify user IDs. Maximum 50
 */
export const followUsers = async (client: HTTPClient, user_ids: string[]) => {
  await client.fetch("/me/following", "void", {
    method: "PUT",
    query: {
      type: "user",
      ids: user_ids
    }
  });
};

/**
 * Add the current user as a follower of an user.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify user ID
 */
export const followUser = async (client: HTTPClient, user_id: string) => {
  return await followUsers(client, [user_id]);
};

/**
 * Remove the current user as a follower of one or more artists.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_ids List of Spotify artist IDs. Maximum 50
 */
export const unfollowArtists = async (
  client: HTTPClient,
  artist_ids: string[]
) => {
  await client.fetch("/me/following", "void", {
    method: "DELETE",
    query: {
      type: "artist",
      ids: artist_ids
    }
  });
};

/**
 * Remove the current user as a follower of specified artist.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const unfollowArtist = async (client: HTTPClient, artist_id: string) => {
  await unfollowArtists(client, [artist_id]);
};

/**
 * Remove the current user as a follower of one or more Spotify users.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param user_ids List of Spotify user IDs. Maximum 50
 */
export const unfollowUsers = async (client: HTTPClient, user_ids: string[]) => {
  await client.fetch("/me/following", "void", {
    method: "DELETE",
    query: {
      type: "user",
      ids: user_ids
    }
  });
};

/**
 * Remove the current user as a follower of specified Spotify user.
 *
 * @requires `user-follow-modify`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify user ID
 */
export const unfollowUser = async (client: HTTPClient, user_id: string) => {
  await unfollowUsers(client, [user_id]);
};

/**
 * Check to see if the current user is following one or more artists.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param artist_ids List of Spotify artist IDs. Maximum 50
 */
export const checkIfUserFollowsArtists = async (
  client: HTTPClient,
  artist_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/following/contains", "json", {
    query: {
      type: "artist",
      ids: artist_ids
    }
  });
};

/**
 * Check to see if the current user is following artist.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param artist_id Spotify artist ID
 */
export const checkIfUserFollowsArtist = async (
  client: HTTPClient,
  artist_id: string
) => {
  return (await checkIfUserFollowsArtists(client, [artist_id]))[0];
};

/**
 * Check to see if the current user is following one or more Spotify users.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param user_ids List of Spotify user IDs. Maximum 50
 */
export const checkIfUserFollowsUsers = async (
  client: HTTPClient,
  user_ids: string[]
) => {
  return await client.fetch<boolean[]>("/me/following/contains", "json", {
    query: {
      type: "user",
      ids: user_ids
    }
  });
};

/**
 * Check to see if the current user is following artist.
 *
 * @requires `user-follow-read`
 *
 * @param client Spotify HTTPClient
 * @param user_id Spotify user ID
 */
export const checkIfUserFollowsUser = async (
  client: HTTPClient,
  user_id: string
) => {
  return (await checkIfUserFollowsUsers(client, [user_id]))[0];
};

/**
 * Check to see if one or more Spotify users are following a specified playlist.
 *
 * @param client Spotify HTTPClient
 * @param user_ids List of Spotify user IDs. Maximum: 5 ids.
 * @param playlist_id Spotify palylist ID
 */
export const checkIfUsersFollowPlaylist = async (
  client: HTTPClient,
  user_ids: string[],
  playlist_id: string
) => {
  return await client.fetch<boolean[]>(
    `/playlists/${playlist_id}/followers/contains`,
    "json",
    {
      query: {
        ids: user_ids
      }
    }
  );
};

/**
 * Check to see Spotify user is following a specified playlist.
 *
 * @param client Spotify HTTPClient
 * @param user_id Spotify user ID
 * @param playlist_id Spotify palylist ID
 */
export const checkIfUserFollowsPlaylist = async (
  client: HTTPClient,
  user_id: string,
  playlist_id: string
) => {
  return (await checkIfUsersFollowPlaylist(client, [user_id], playlist_id))[0];
};
