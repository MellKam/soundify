import { createURLWithParams } from "../utils.ts";
import { API_TOKEN_URL } from "./auth.consts.ts";
import { getBasicAuthHeader } from "./auth.helpers.ts";
import {
	ApiTokenRequestParams,
	ClientCredentialsResponse,
} from "./auth.types.ts";

/**
 * The Client Credentials flow is used in server-to-server authentication.
 * Since this flow does not include authorization, only endpoints that
 * do not access user information can be accessed.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
 */
export class ClientCredentialsFlow {
	private readonly BASIC_AUTH_HEADER: string;
	constructor(
		private readonly config: {
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_CLIENT_SECRET: string;
		},
	) {
		this.BASIC_AUTH_HEADER = getBasicAuthHeader(
			this.config.SPOTIFY_CLIENT_ID,
			this.config.SPOTIFY_CLIENT_SECRET,
		);
	}

	async getAccessToken() {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					grant_type: "client_credentials",
				},
			),
			{
				headers: {
					Authorization: this.BASIC_AUTH_HEADER,
					"Content-Type": "application/x-www-form-urlencoded",
					Accept: "application/json",
				},
				method: "POST",
			},
		);

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as ClientCredentialsResponse;
	}
}
