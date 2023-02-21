import { createURLWithParams } from "../utils.ts";
import { AUTHORIZE_URL } from "./auth.consts.ts";
import {
	AccessTokenResponse,
	GetAuthURLOptions,
	RequestUserAuthParams,
} from "./auth.types.ts";

/**
 * Spotify auth service that uses "Implicit Grant Flow"
 *
 * The implicit grant flow is carried out on the client side and it does not
 * involve secret keys. Thus, you do not need any server-side code to use it.
 * Access tokens issued are short-lived with no refresh token to extend them
 * when they expire.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/implicit-grant/
 */
export class ImplicitGrantService {
	constructor(
		private readonly config: {
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_REDIRECT_URI: string;
		},
	) {}

	getAuthURL(opts: GetAuthURLOptions) {
		return createURLWithParams<RequestUserAuthParams>(
			AUTHORIZE_URL,
			{
				response_type: "token",
				client_id: this.config.SPOTIFY_CLIENT_ID,
				scope: opts.scopes?.join(" "),
				redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
				state: opts.state,
				show_dialog: opts.show_dialog,
			},
		);
	}

	getGrantData(urlHash: string, state?: string): AccessTokenResponse {
		const searchParams = new URLSearchParams(urlHash.substring(1));

		const error = searchParams.get("error");
		if (error) {
			throw new Error(error);
		}

		if (state) {
			const expectedState = searchParams.get("state");

			if (expectedState === null) {
				throw new Error("Can't find 'state' in query params");
			}

			if (state !== expectedState) {
				throw new Error("State from url does not match the passed state");
			}
		}

		const access_token = searchParams.get("access_token");
		const token_type = searchParams.get("token_type");
		const expires_in = Number(searchParams.get("expires_in"));

		if (isNaN(expires_in)) {
			throw new Error("Invalid 'expires_in' param");
		}

		if (!access_token || !token_type) {
			throw new Error("Cannot get params");
		}

		return {
			access_token,
			token_type,
			expires_in,
		} as AccessTokenResponse;
	}
}
