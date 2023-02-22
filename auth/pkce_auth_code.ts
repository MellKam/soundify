import { searchParamsFromObj } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL, AuthScope } from "./consts.ts";
import {
	ApiTokenReqParams,
	AuthorizeReqParams,
	IAuthProvider,
	KeypairResponse,
} from "./types.ts";
import { getPKCECodeChallenge } from "../platform/platform.deno.ts";
export { getPKCECodeChallenge as getCodeChallenge } from "../platform/platform.deno.ts";

export const getAuthURL = (
	{ scopes, ...opts }: {
		client_id: string;
		redirect_uri: string;
		code_challenge: string;
		scopes?: AuthScope[];
	},
) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = searchParamsFromObj<AuthorizeReqParams>(
		{
			response_type: "code",
			scope: scopes?.join(" "),
			code_challenge_method: "S256",
			...opts,
		},
	).toString();

	return url;
};

export const getGrantData = async (opts: {
	code: string;
	code_verifier: string;
	client_id: string;
	redirect_uri: string;
}) => {
	const res = await fetch(
		API_TOKEN_URL,
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				Accept: "application/json",
			},
			method: "POST",
			body: searchParamsFromObj<ApiTokenReqParams>({
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
 * PKCE Code Verifier
 *
 * The code verifier is a random string between 43 and 128 characters in length.
 * It can contain letters, digits, underscores, periods, hyphens, or tildes.
 */
export const generateCodeVerifier = (length = 64) => {
	let code_verifier = "";
	for (let i = 0; i < length; i++) {
		code_verifier += PKCEVerifierChars.charAt(
			Math.floor(Math.random() * PKCEVerifierChars.length),
		);
	}
	return code_verifier;
};

export const generateCodes = async () => {
	const code_verifier = generateCodeVerifier();
	const code_challenge = await getPKCECodeChallenge(code_verifier);

	return { code_verifier, code_challenge };
};

export class AuthProvider implements IAuthProvider {
	constructor(
		private opts: {
			readonly client_id: string;
			access_token?: string;
			refresh_token: string;
			readonly saveAccessToken?: (access_token: string) => void;
			readonly saveRefreshToken?: (refresh_token: string) => void;
		},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh || !this.opts.access_token) {
			await this.refresh();
		}

		return this.opts.access_token!;
	}

	async refresh() {
		const res = await fetch(API_TOKEN_URL, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				Accept: "application/json",
			},
			method: "POST",
			body: searchParamsFromObj<ApiTokenReqParams>({
				grant_type: "refresh_token",
				client_id: this.opts.client_id,
				refresh_token: this.opts.refresh_token,
			}),
		});

		if (!res.ok) {
			throw new Error(await res.text());
		}

		const data = (await res.json()) as KeypairResponse;

		this.opts.refresh_token = data.refresh_token;
		this.opts.access_token = data.access_token;
		if (this.opts.saveAccessToken) this.opts.saveAccessToken(data.access_token);
		if (this.opts.saveRefreshToken) {
			this.opts.saveRefreshToken(data.refresh_token);
		}
		return data;
	}
}
