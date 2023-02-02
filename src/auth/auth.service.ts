import { createURLWithParams } from "../utils.ts";
import { encodeBase64 } from "../platform.deno.ts";
import {
	type AccessTokenResponse,
	type ClientCredentialsResponse,
	GetRedirectURIParams,
	type KeypairResponse,
	type RequestUserAuthParams,
} from "./auth.types.ts";

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

	getAuthCodeRedirectURI(
		opts: GetRedirectURIParams,
	) {
		return createURLWithParams<RequestUserAuthParams>(
			`${AUTH_API_PREFIX}/authorize`,
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

	getImplicitGrantRedirectURI(opts: GetRedirectURIParams) {
		return createURLWithParams<RequestUserAuthParams>(
			`${AUTH_API_PREFIX}/authorize`,
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

		return (await res.json()) as KeypairResponse;
	}

	async getAccessByRefreshToken(refreshToken: string) {
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

		return (await res.json()) as AccessTokenResponse;
	}

	async getAccessToken() {
		const res = await fetch(`${AUTH_API_PREFIX}/api/token`, {
			headers: {
				Authorization: this.AUTH_HEADER,
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			method: "POST",
			body: new URLSearchParams({
				grant_type: "client_credentials",
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as ClientCredentialsResponse;
	}
}
