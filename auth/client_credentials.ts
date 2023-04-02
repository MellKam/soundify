import {
	AccessResponse,
	getBasicAuthHeader,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";
import { AuthProvider, AuthProviderOpts } from "shared/mod.ts";

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

	createAuthProvider(opts?: AuthProviderOpts<AccessResponse>) {
		return new AuthProvider({
			refresher: (() => this.getAccessToken()).bind(this),
			...opts,
		});
	}
}
