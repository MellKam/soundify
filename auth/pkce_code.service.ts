import { createURLWithParams } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL } from "./auth.consts.ts";
import {
	AccessTokenResponse,
	ApiTokenRequestParams,
	GetAuthURLPKCEOptions,
	KeypairResponse,
	RequestUserAuthParams,
} from "./auth.types.ts";
import { getPKCECodeChallenge } from "../platform/platform.deno.ts";

const PKCEVerifierChars =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export class PKCECodeService {
	constructor(
		private readonly config: {
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_REDIRECT_URI: string;
		},
	) {}

	getAuthURL(
		opts: GetAuthURLPKCEOptions,
	) {
		return createURLWithParams<RequestUserAuthParams>(
			AUTHORIZE_URL,
			{
				response_type: "code",
				client_id: this.config.SPOTIFY_CLIENT_ID,
				scope: opts.scopes?.join(" "),
				redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
				show_dialog: opts.show_dialog,
				code_challenge: opts.code_challenge,
				code_challenge_method: "S256",
			},
		);
	}

	async getGrantData(code: string, code_verifier: string) {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					grant_type: "authorization_code",
					client_id: this.config.SPOTIFY_CLIENT_ID,
					code,
					code_verifier,
					redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
				},
			),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
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

	/**
	 * PKCE Code Verifier
	 *
	 * The code verifier is a random string between 43 and 128 characters in length.
	 * It can contain letters, digits, underscores, periods, hyphens, or tildes.
	 */
	generateCodeVerifier(length = 64): string {
		let code_verifier = "";
		for (let i = 0; i < length; i++) {
			code_verifier += PKCEVerifierChars.charAt(
				Math.floor(Math.random() * PKCEVerifierChars.length),
			);
		}
		return code_verifier;
	}

	async getCodeChallenge(codeVerifier: string) {
		return await getPKCECodeChallenge(codeVerifier);
	}

	async refreshAccessToken(refreshToken: string) {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					grant_type: "refresh_token",
					client_id: this.config.SPOTIFY_CLIENT_ID,
					refresh_token: refreshToken,
				},
			),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
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
