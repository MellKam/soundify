import * as endpoints from "api/endpoints.ts";
import { HTTPClient, SpotifyClient, SpotifyClientOpts } from "api/client.ts";
import { IAuthProvider } from "../mod.ts";

type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R
	: never;

export type ISpoitfyAPI = {
	[K in keyof typeof endpoints]: (
		...args: OmitFirst<Parameters<typeof endpoints[K]>>
	) => ReturnType<typeof endpoints[K]>;
};

type Endpoint = (client: HTTPClient, ...args: unknown[]) => Promise<unknown>;

/**
 * ! Experimental
 *
 * Assings endpoint functions to client and binds client to each of them
 */
export const createSpotifyAPI = <T extends IAuthProvider | string>(
	authProvider: T,
	opts?: SpotifyClientOpts,
) => {
	const client = new SpotifyClient(authProvider, opts);

	for (const [name, fn] of Object.entries(endpoints)) {
		// deno-lint-ignore no-explicit-any
		(client as any)[name] = (fn as Endpoint)
			.bind(
				null,
				client,
			);
	}

	return client as ISpoitfyAPI & SpotifyClient<T>;
};
