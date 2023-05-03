import * as endpoints from "./endpoints";
import { HTTPClient, SpotifyClient, SpotifyClientOpts } from "./client";
import { IAuthProvider } from "../shared";

import { SearchEndpoint } from "./search/search.endpoints";
import { UserTopItemsEndpoint } from "./user/user.endpoints";

// We separate endpoints with generics because we can't access function
// generics from another type or somehow copy them to another function.
// At least I couldn't do that. :) If you know it, open the issue.
type EndpointsWithGeneric = SearchEndpoint & UserTopItemsEndpoint;
type EndpointNamesWithGeneric = keyof EndpointsWithGeneric;

type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R]
  ? R
  : never;

type EndpointName = keyof typeof endpoints;

export type ISpoitfyAPI = EndpointsWithGeneric & {
  [K in Exclude<EndpointName, EndpointNamesWithGeneric>]: (
    ...args: OmitFirst<Parameters<(typeof endpoints)[K]>>
  ) => ReturnType<(typeof endpoints)[K]>;
};

type Endpoint = (client: HTTPClient, ...args: any[]) => Promise<any>;

/**
 * Assings endpoint functions to client and binds client to each of them
 */
export const createSpotifyAPI = <
  T extends IAuthProvider | string = IAuthProvider | string
>(
  authProvider: T,
  opts?: SpotifyClientOpts
) => {
  const client = new SpotifyClient(authProvider, opts) as SpotifyClient<T> &
    ISpoitfyAPI;

  for (const name in endpoints) {
    client[name as EndpointName] = (
      endpoints[name as EndpointName] as Endpoint
    ).bind(null, client);
  }

  return client;
};
