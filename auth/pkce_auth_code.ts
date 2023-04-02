import { toQueryString } from "shared/mod.ts";
import {
	ApiTokenReqParams,
	AuthorizeReqParams,
	AuthScope,
	KeypairResponse,
	parseCallbackData,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";
import {
	getPKCECodeChallenge,
	getRandomBytes,
} from "auth/platform/platform.deno.ts";
import { AuthProvider, AuthProviderOpts } from "shared/mod.ts";

export type GetAuthURLOpts = {
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 */
	redirect_uri: string;
	/**
	 * PKCE code that you generated from `code_verifier`.
	 * You can get it with the `getCodeChallenge` function.
	 */
	code_challenge: string;
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
	/**
	 * List of scopes.
	 *
	 * @default
	 * If no scopes are specified, authorization will be granted
	 * only to access publicly available information
	 */
	scopes?: AuthScope[];
};

export type GetGrantDataOpts = {
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 */
	redirect_uri: string;
	/**
	 * The random code you generated before redirecting the user to spotify auth
	 */
	code_verifier: string;
	/**
	 * An authorization code that can be exchanged for an Access Token.
	 * The code that Spotify produces after redirecting to `redirect_uri`.
	 */
	code: string;
};

export class PKCEAuthCode {
	static VERIFIER_CHARS =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

	constructor(
		private readonly client_id: string,
	) {}

	getAuthURL(
		{ scopes, ...opts }: GetAuthURLOpts,
	) {
		const url = new URL(SPOTIFY_AUTH + "authorize");

		url.search = toQueryString<AuthorizeReqParams>({
			response_type: "code",
			scope: scopes?.join(" "),
			code_challenge_method: "S256",
			client_id: this.client_id,
			...opts,
		});

		return url;
	}

	/**
	 * Generates random PKCE Code Verifier
	 *
	 * The code verifier is a random string between 43 and 128 characters in length.
	 *
	 * @param length Must be between 43 and 128 characters
	 * @default 64
	 */
	static generateCodeVerifier(
		length = 64,
	) {
		const randomBytes = getRandomBytes(length);

		let codeVerifier = "";
		for (let i = 0; i < length; i++) {
			codeVerifier += PKCEAuthCode
				.VERIFIER_CHARS[randomBytes[i] % PKCEAuthCode.VERIFIER_CHARS.length];
		}

		return codeVerifier;
	}

	static getCodeChallenge = getPKCECodeChallenge;

	/**
	 * Shorthand for generating PKCE codes.
	 * Uses `generateCodeVerifier` and `getCodeChallenge` under the hood.
	 */
	static async generateCodes(verifierLength?: number) {
		const code_verifier = PKCEAuthCode.generateCodeVerifier(verifierLength);
		const code_challenge = await getPKCECodeChallenge(code_verifier);

		return { code_verifier, code_challenge };
	}

	static parseCallbackData = parseCallbackData;

	async getGrantData(opts: GetGrantDataOpts) {
		const url = new URL(SPOTIFY_AUTH + "api/token");
		url.search = toQueryString<ApiTokenReqParams>({
			grant_type: "authorization_code",
			client_id: this.client_id,
			...opts,
		});

		const res = await fetch(url, {
			headers: {
				"Content-Type": URL_ENCODED,
			},
			method: "POST",
		});

		if (!res.ok) {
			throw new SpotifyAuthError(await res.text(), res.status);
		}

		return (await res.json()) as KeypairResponse;
	}

	/**
	 * Requests a new token keypair using your old refresh token and client ID
	 */
	async refresh(refresh_token: string) {
		const url = new URL(SPOTIFY_AUTH + "api/token");
		url.search = toQueryString<ApiTokenReqParams>({
			grant_type: "refresh_token",
			client_id: this.client_id,
			refresh_token,
		});

		const res = await fetch(url, {
			headers: {
				"Content-Type": URL_ENCODED,
			},
			method: "POST",
		});

		if (!res.ok) {
			throw new SpotifyAuthError(await res.text(), res.status);
		}

		return (await res.json()) as KeypairResponse;
	}

	createAuthProvider(
		refresh_token: string,
		opts?: Omit<AuthProviderOpts<KeypairResponse>, "refresher">,
	) {
		return new AuthProvider({
			refresher: (async () => {
				const data = await this.refresh(refresh_token);
				refresh_token = data.refresh_token;
				return data;
			}).bind(this),
			...opts,
		});
	}
}
