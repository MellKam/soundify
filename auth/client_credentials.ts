import {
	AccessResponse,
	getBasicAuthHeader,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";
import { IAuthProvider } from "shared/mod.ts";

export const getAccessToken = async (opts: {
	client_id: string;
	client_secret: string;
}) => {
	const res = await fetch(SPOTIFY_AUTH + "api/token", {
		method: "POST",
		headers: {
			"Authorization": getBasicAuthHeader(
				opts.client_id,
				opts.client_secret,
			),
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
};

export type AuthProviderCreds = {
	client_id: string;
	client_secret: string;
	access_token?: string;
};

export type AuthProviderOpts = {
	onRefresh?: (data: AccessResponse) => void | Promise<void>;
	onRefreshFailure?: (error: Error) => void | Promise<void>;
};

export class AuthProvider implements IAuthProvider {
	private readonly creds: Required<AuthProviderCreds>;

	constructor(
		credentials: AuthProviderCreds,
		private readonly opts: AuthProviderOpts = {},
	) {
		this.creds = {
			...credentials,
			access_token: credentials.access_token ?? "",
		};
	}

	getToken(): string {
		return this.creds.access_token;
	}

	async refreshToken() {
		try {
			const data = await getAccessToken(this.creds);

			this.creds.access_token = data.access_token;
			if (this.opts.onRefresh) await this.opts.onRefresh(data);
			return this.creds.access_token;
		} catch (error) {
			if (this.opts.onRefreshFailure) await this.opts.onRefreshFailure(error);
			throw error;
		}
	}
}
