import { createURLWithParams } from "../utils.ts";
import { encodeBase64 } from "../platform.deno.ts";
import {
	type RequestUserAuthParams,
	type SpotifyAccessTokenResponse,
	type SpotifyTokensResponse,
} from "./auth.types.ts";
import { AuthScope } from "./auth.scopes.ts";

export const AUTH_API_PREFIX = "https://accounts.spotify.com";

export class SpotifyAuthService {
	private readonly AUTH_HEADER: string;

	constructor(
		private readonly config: {
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_CLIENT_SECRET: string;
			SPOTIFY_REDIRECT_URI: string;
		},
	) {
		this.AUTH_HEADER = "Basic " +
			encodeBase64(
				this.config.SPOTIFY_CLIENT_ID + ":" + this.config.SPOTIFY_CLIENT_SECRET,
			);
	}

	getRedirectAuthURI(
		opts: {
			/**
			 * @description This provides protection against attacks such as
			 * cross-site request forgery.
			 */
			state?: string;
			/**
			 * @description List of scopes.
			 *
			 * @default
			 * If no scopes are specified, authorization will be granted
			 * only to access publicly available information
			 */
			scopes?: AuthScope[];
			/**
			 * @description Whether or not to force the user to approve the app again
			 * if they’ve already done so.
			 *
			 * - If false, a user who has already approved the application
			 *  may be automatically redirected to the URI specified by `redirect_uri`.
			 * - If true, the user will not be automatically redirected and will have
			 *  to approve the app again.
			 *
			 * @default false
			 */
			show_dialog?: boolean;
		},
	) {
		return createURLWithParams(`${AUTH_API_PREFIX}/authorize`, {
			response_type: "code",
			client_id: this.config.SPOTIFY_CLIENT_ID,
			scope: opts.scopes?.join(" "),
			redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
			state: opts.state,
			show_dialog: opts.show_dialog,
		} as RequestUserAuthParams);
	}

	async getKeypairByAuthCode(code: string) {
		const res = await fetch(`${AUTH_API_PREFIX}/api/token`, {
			headers: {
				Authorization: this.AUTH_HEADER,
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			method: "POST",
			body: new URLSearchParams({
				code,
				redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
				grant_type: "authorization_code",
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as SpotifyTokensResponse;
	}

	async refreshAccessToken(refreshToken: string) {
		const res = await fetch(`${AUTH_API_PREFIX}/api/token`, {
			headers: {
				Authorization: this.AUTH_HEADER,
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			method: "POST",
			body: new URLSearchParams({
				refresh_token: refreshToken,
				grant_type: "refresh_token",
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as SpotifyAccessTokenResponse;
	}
}
