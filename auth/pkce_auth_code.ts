import { IAccessProvider, objectToSearchParams } from "shared/mod.ts";
import {
	API_TOKEN_URL,
	ApiTokenReqParams,
	AUTHORIZE_URL,
	AuthorizeReqParams,
	AuthScope,
	KeypairResponse,
	URL_ENCODED,
} from "auth/general.ts";
import { getPKCECodeChallenge } from "auth/platform/platform.deno.ts";

export type GetAuthURLOpts = {
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

export const getAuthURL = (
	{ scopes, ...opts }: GetAuthURLOpts,
) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = objectToSearchParams<AuthorizeReqParams>(
		{
			response_type: "code",
			scope: scopes?.join(" "),
			code_challenge_method: "S256",
			...opts,
		},
	).toString();

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

export const getGrantData = async (opts: GetGrantDataOpts) => {
	const res = await fetch(
		API_TOKEN_URL,
		{
			headers: {
				"Content-Type": URL_ENCODED,
			},
			method: "POST",
			body: objectToSearchParams<ApiTokenReqParams>({
				grant_type: "authorization_code",
				...opts,
			}),
		},
	);

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return (await res.json()) as KeypairResponse;
};

const PKCEVerifierChars =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/**
 * Generates random PKCE Code Verifier
 *
 * The code verifier is a random string between 43 and 128 characters in length.
 * It can contain letters, digits, underscores, periods, hyphens, or tildes.
 */
export const generateCodeVerifier = (
	/**
	 * Must be between 43 and 128 characters
	 * @default 64
	 */
	length = 64,
) => {
	let code_verifier = "";
	for (let i = 0; i < length; i++) {
		code_verifier += PKCEVerifierChars.charAt(
			Math.floor(Math.random() * PKCEVerifierChars.length),
		);
	}
	return code_verifier;
};

export { getPKCECodeChallenge as getCodeChallenge } from "./platform/platform.deno.ts";

/**
 * Shorthand for generating PKCE codes.
 * Uses `generateCodeVerifier` and `getCodeChallenge` under the hood.
 */
export const generateCodes = async () => {
	const code_verifier = generateCodeVerifier();
	const code_challenge = await getPKCECodeChallenge(code_verifier);

	return { code_verifier, code_challenge };
};

export const refresh = async (opts: {
	client_id: string;
	refresh_token: string;
}) => {
	const res = await fetch(API_TOKEN_URL, {
		headers: {
			"Content-Type": URL_ENCODED,
		},
		method: "POST",
		body: objectToSearchParams<ApiTokenReqParams>({
			grant_type: "refresh_token",
			client_id: opts.client_id,
			refresh_token: opts.refresh_token,
		}),
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return (await res.json()) as KeypairResponse;
};

export class AccessProvider implements IAccessProvider {
	constructor(
		private opts: {
			readonly client_id: string;
			access_token?: string;
			refresh_token: string;
			readonly onRefresh?: (data: KeypairResponse) => void | Promise<void>;
		},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || !this.opts.access_token) {
			const data = await refresh({
				client_id: this.opts.client_id,
				refresh_token: this.opts.refresh_token,
			});

			this.opts.refresh_token = data.refresh_token;
			this.opts.access_token = data.access_token;

			if (this.opts.onRefresh) await this.opts.onRefresh(data);
		}

		return this.opts.access_token!;
	}
}
