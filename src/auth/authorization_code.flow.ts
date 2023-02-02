import { createURLWithParams } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL } from "./auth.consts.ts";
import { getBasicAuthHeader } from "./auth.helpers.ts";
import {
	AccessTokenResponse,
	ApiTokenRequestParams,
	GetAuthURLOptions,
	KeypairResponse,
	RequestUserAuthParams,
} from "./auth.types.ts";

/**
 * The authorization code flow is suitable for long-running applications
 * (e.g. web and mobile apps) where the user grants permission only once.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export class AuthorizationCodeFlow {
	private readonly BASIC_AUTH_HEADER: string;
	constructor(
		private readonly config: {
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_CLIENT_SECRET: string;
			SPOTIFY_REDIRECT_URI: string;
		},
	) {
		this.BASIC_AUTH_HEADER = getBasicAuthHeader(
			this.config.SPOTIFY_CLIENT_ID,
			this.config.SPOTIFY_CLIENT_SECRET,
		);
	}

	getAuthURL(
		opts: GetAuthURLOptions,
	) {
		return createURLWithParams<RequestUserAuthParams>(
			AUTHORIZE_URL,
			{
				response_type: "code",
				client_id: this.config.SPOTIFY_CLIENT_ID,
				scope: opts.scopes?.join(" "),
				redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
				state: opts.state,
				show_dialog: opts.show_dialog,
			},
		);
	}

	async getKeypairByAuthCode(code: string) {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					code,
					redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
					grant_type: "authorization_code",
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

		return (await res.json()) as KeypairResponse;
	}

	async getAccessByRefreshToken(refreshToken: string) {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					refresh_token: refreshToken,
					grant_type: "refresh_token",
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

		return (await res.json()) as AccessTokenResponse;
	}
}
