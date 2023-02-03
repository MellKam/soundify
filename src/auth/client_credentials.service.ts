import { getBasicAuthHeader, postApiTokenRoute } from "./auth.helpers.ts";
import { AccessTokenWithScope } from "./auth.types.ts";

/**
 * Spotify auth service that uses "Client Credenials Flow"
 *
 * The Client Credentials flow is used in server-to-server authentication.
 * Since this flow does not include authorization, only endpoints that
 * do not access user information can be accessed.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
 */
export class ClientCredentialsService {
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
		const res = await postApiTokenRoute(this.BASIC_AUTH_HEADER, {
			grant_type: "client_credentials",
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as AccessTokenWithScope;
	}
}
