import { IAuthProvider, toQueryString } from "shared/mod.ts";
import {
	ApiTokenReqParams,
	AuthorizeReqParams,
	AuthScope,
	KeypairResponse,
	SPOTIFY_AUTH,
	SpotifyAuthError,
	URL_ENCODED,
} from "auth/general.ts";
import {
	getPKCECodeChallenge,
	getRandomBytes,
} from "auth/platform/platform.deno.ts";

export type GetRedirectURLOpts = {
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 * This URI needs to have been entered in the _Redirect URI Allowlist_
	 * that you specified when you registered your application.
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

export const getRedirectURL = (
	{ scopes, ...opts }: GetRedirectURLOpts,
) => {
	const url = new URL(SPOTIFY_AUTH + "authorize");

	url.search = toQueryString<AuthorizeReqParams>({
		response_type: "code",
		scope: scopes?.join(" "),
		code_challenge_method: "S256",
		...opts,
	});

	return url;
};

export type GetGrantDataOpts = {
	/**
	 * The random code you generated before redirecting the user to spotify auth
	 */
	code_verifier: string;
	/**
	 * An authorization code that can be exchanged for an Access Token.
	 * The code that Spotify produces after redirecting to `redirect_uri`.
	 */
	code: string;
	/**
	 * The Client ID generated after registering your Spotify application.
	 */
	client_id: string;
	/**
	 * The URI to redirect to after the user grants or denies permission.
	 * This URI needs to have been entered in the _Redirect URI Allowlist_
	 * that you specified when you registered your application.
	 */
	redirect_uri: string;
};

export { parseCallbackData } from "auth/general.ts";

export const getGrantData = async (opts: GetGrantDataOpts) => {
	const url = new URL(SPOTIFY_AUTH + "api/token");
	url.search = toQueryString<ApiTokenReqParams>({
		grant_type: "authorization_code",
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
};

const PKCE_VERIFIER_CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/**
 * Generates random PKCE Code Verifier
 *
 * The code verifier is a random string between 43 and 128 characters in length.
 *
 * @param length Must be between 43 and 128 characters
 * @default 64
 */
export const generateCodeVerifier = (
	length = 64,
) => {
	const randomBytes = getRandomBytes(length);

	let codeVerifier = "";
	for (let i = 0; i < length; i++) {
		codeVerifier +=
			PKCE_VERIFIER_CHARS[randomBytes[i] % PKCE_VERIFIER_CHARS.length];
	}

	return codeVerifier;
};

export { getPKCECodeChallenge as getCodeChallenge } from "auth/platform/platform.deno.ts";

/**
 * Shorthand for generating PKCE codes.
 * Uses `generateCodeVerifier` and `getCodeChallenge` under the hood.
 */
export const generateCodes = async (verifierLength?: number) => {
	const code_verifier = generateCodeVerifier(verifierLength);
	const code_challenge = await getPKCECodeChallenge(code_verifier);

	return { code_verifier, code_challenge };
};

/**
 * Requests a new token keypair using your old refresh token and client ID
 */
export const refresh = async (opts: {
	client_id: string;
	refresh_token: string;
}) => {
	const url = new URL(SPOTIFY_AUTH + "api/token");
	url.search = toQueryString<ApiTokenReqParams>({
		grant_type: "refresh_token",
		client_id: opts.client_id,
		refresh_token: opts.refresh_token,
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
};

export type AuthProviderConfig = {
	client_id: string;
	refresh_token: string;
	access_token: string;
};

export type AuthProviderOpts = {
	onRefresh?: (data: KeypairResponse) => void | Promise<void>;
	onRefreshFailure?: (error: Error) => void | Promise<void>;
};

export class AuthProvider implements IAuthProvider {
	constructor(
		private readonly config: AuthProviderConfig,
		private readonly opts: AuthProviderOpts = {},
	) {}

	static async create(
		config: Omit<AuthProviderConfig, "access_token">,
		opts?: AuthProviderOpts,
	) {
		const data = await refresh(config);

		return new AuthProvider(
			{ ...config, access_token: data.access_token },
			opts,
		);
	}

	getToken() {
		return this.config.access_token;
	}

	async refreshToken() {
		try {
			const data = await refresh(this.config);

			this.config.refresh_token = data.refresh_token;
			this.config.access_token = data.access_token;

			if (this.opts.onRefresh) await this.opts.onRefresh(data);
			return this.config.access_token;
		} catch (error) {
			if (this.opts.onRefreshFailure) await this.opts.onRefreshFailure(error);
			throw error;
		}
	}
}
