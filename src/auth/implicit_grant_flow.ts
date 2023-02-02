import { createURLWithParams } from "../utils.ts";
import { AUTHORIZE_URL } from "./auth.consts.ts";
import { GetAuthURLOptions, RequestUserAuthParams } from "./auth.types.ts";

/**
 * The implicit grant flow is carried out on the client side and it does not
 * involve secret keys. Thus, you do not need any server-side code to use it.
 * Access tokens issued are short-lived with no refresh token to extend them
 * when they expire.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/implicit-grant/
 */
export class ImplicitGrantFlow {
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
}
