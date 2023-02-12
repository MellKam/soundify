import { createURLWithParams } from "../utils.ts";
import { AUTHORIZE_URL } from "./auth.consts.ts";
import { getBasicAuthHeader, postApiTokenRoute } from "./auth.helpers.ts";
import {
	AccessTokenResponse,
	GetAuthURLOptions,
	KeypairResponse,
	RequestUserAuthParams,
} from "./auth.types.ts";
import { AuthProvider } from "./auth.provider.ts";

/**
 * Spotify auth service that uses "Authorization Code Flow"
 *
 * The authorization code flow is suitable for long-running applications
 * (e.g. web and mobile apps) where the user grants permission only once.
 *
 * @link https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
 */
export class AuthCodeService {
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

	async getGrantData(searchParams: URLSearchParams, state?: string) {
		if (state) {
			const expectedState = searchParams.get("state");

			if (expectedState === null) {
				throw new Error("Can't find 'state' in query params");
			}

			if (state !== expectedState) {
				throw new Error("State from url does not match the passed state");
			}
		}

		const code = searchParams.get("code");
		if (code === null) {
			throw new Error("Can't find 'code' in query params");
		}

		const res = await postApiTokenRoute(this.BASIC_AUTH_HEADER, {
			code,
			redirect_uri: this.config.SPOTIFY_REDIRECT_URI,
			grant_type: "authorization_code",
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as KeypairResponse;
	}

	async refreshAccessToken(refreshToken: string) {
		const res = await postApiTokenRoute(this.BASIC_AUTH_HEADER, {
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as AccessTokenResponse;
	}

	getProvider(
		{ refresh_token, ...rest }: {
			refresh_token: string;
			access_token?: string;
			expires_in?: number;
		},
	) {
		return new AuthProvider({
			refresh: this.refreshAccessToken.bind(this, refresh_token),
			...rest,
		});
	}

	async getProviderFromGrantData(
		searchParams: URLSearchParams,
		state?: string,
	) {
		const data = await this.getGrantData(searchParams, state);
		return this.getProvider(data);
	}
}
