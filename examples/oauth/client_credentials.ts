import * as oauth from "oauth4webapi";
import { SPOTIFY_AUTH_URL } from "@soundify/web-api";
import { z } from "zod";
import { load } from "std/dotenv/mod.ts";
import { search, SpotifyClient } from "@soundify/web-api";

await load({ export: true });

const env = z
	.object({
		SPOTIFY_CLIENT_ID: z.string(),
		SPOTIFY_CLIENT_SECRET: z.string(),
	})
	.parse(Deno.env.toObject());

const issuer = new URL(SPOTIFY_AUTH_URL);
const authServer = await oauth.processDiscoveryResponse(
	issuer,
	await oauth.discoveryRequest(issuer),
);

const oauthClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
	token_endpoint_auth_method: "client_secret_basic",
};

const refresher = async () => {
	const res = await oauth.clientCredentialsGrantRequest(
		authServer,
		oauthClient,
		{},
	);

	const result = await oauth.processClientCredentialsResponse(
		authServer,
		oauthClient,
		res,
	);
	if (oauth.isOAuth2Error(result)) {
		throw new Error(
			result.error + result.error_description
				? " : " + result.error_description
				: "",
		);
	}
	return result.access_token;
};

const accessToken = await refresher();

const spotifyClient = new SpotifyClient(accessToken);

const result = await search(spotifyClient, "track", "Never Gonna Give You Up");
console.log(result.tracks.items.at(0));
