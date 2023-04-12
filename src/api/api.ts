import * as endpoints from "./endpoints";
import { HTTPClient, SpotifyClient, SpotifyClientOpts } from "./client";
import { IAuthProvider } from "../shared";
import { SearchEndpoint } from "./search/search.endpoints";

type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R]
  ? R
  : never;

export type ISpoitfyAPI = SearchEndpoint & {
  [K in Exclude<keyof typeof endpoints, "search">]: (
    ...args: OmitFirst<Parameters<(typeof endpoints)[K]>>
  ) => ReturnType<(typeof endpoints)[K]>;
};

// deno-lint-ignore no-explicit-any
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

  (Object.keys(endpoints) as (keyof typeof endpoints)[]).forEach((name) => {
    client[name] = (endpoints[name] as Endpoint).bind(null, client);
  });

  return client;
};
