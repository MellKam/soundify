import {
	AccessResponse,
	getBasicAuthHeader,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";
import { IAuthProvider } from "shared/mod.ts";

export type OnRefresh = (
	/**
	 * New authorization data that is returned after the update
	 */
	data: AccessResponse,
) => void | Promise<void>;

export type OnRefreshFailure = (
	/**
	 * Error that occurred during the refresh
	 */
	error: SpotifyAuthError,
) => void | Promise<void>;

export type AuthProviderOpts = {
	access_token?: string;
	/**
	 * A callback event that is triggered after a successful refresh
	 */
	onRefresh?: OnRefresh;
	/**
	 * The callback event that is triggered after a failed token refresh
	 */
	onRefreshFailure?: OnRefreshFailure;
};

export class AuthProvider implements IAuthProvider {
	private access_token: string;
	private readonly onRefresh?: OnRefresh;
	private readonly onRefreshFailure?: OnRefreshFailure;

	constructor(
		private readonly authFlow: ClientCredentials,
		opts: AuthProviderOpts = {},
	) {
		this.access_token = opts.access_token ?? "";
		this.onRefresh = opts.onRefresh;
		this.onRefreshFailure = opts.onRefreshFailure;
	}

	getToken(): string {
		return this.access_token;
	}

	async refreshToken() {
		try {
			const data = await this.authFlow.getAccessToken();

			this.access_token = data.access_token;
			if (this.onRefresh) await this.onRefresh(data);
			return this.access_token;
		} catch (error) {
			if (this.onRefreshFailure) await this.onRefreshFailure(error);
			throw error;
		}
	}
}

export class ClientCredentials {
	private readonly basicAuthHeader: string;

	constructor(
		private readonly creds: {
			client_id: string;
			client_secret: string;
		},
	) {
		this.basicAuthHeader = getBasicAuthHeader(
			creds.client_id,
			creds.client_secret,
		);
	}

	async getAccessToken() {
		const res = await fetch(SPOTIFY_AUTH + "api/token", {
			method: "POST",
			headers: {
				"Authorization": this.basicAuthHeader,
				"Content-Type": URL_ENCODED,
			},
			body: new URLSearchParams({
				grant_type: "client_credentials",
			}),
		});

		if (!res.ok) {
			throw new SpotifyAuthError(await res.text(), res.status);
		}

		return (await res.json()) as AccessResponse;
	}

	createAuthProvider(opts?: AuthProviderOpts) {
		return new AuthProvider(this, opts);
	}
}
