import { createURLWithParams } from "../utils.ts";
import { API_TOKEN_URL, AUTHORIZE_URL, AuthScope } from "./auth.consts.ts";
import {
	ApiTokenRequestParams,
	IAuthProvider,
	KeypairResponse,
	RequestUserAuthParams,
} from "./auth.types.ts";
import { getPKCECodeChallenge } from "../platform/platform.deno.ts";
export { getPKCECodeChallenge as getCodeChallenge } from "../platform/platform.deno.ts";

export const getAuthURL = (
	opts: {
		client_id: string;
		redirect_uri: string;
		code_challenge: string;
		scopes?: AuthScope[];
	},
) => {
	const { scopes, ...rest } = opts;
	return createURLWithParams<RequestUserAuthParams>(
		AUTHORIZE_URL,
		{
			response_type: "code",
			scope: scopes?.join(" "),
			code_challenge_method: "S256",
			...rest,
		},
	);
};

export const getGrantData = async (opts: {
	code: string;
	code_verifier: string;
	client_id: string;
	redirect_uri: string;
}) => {
	const res = await fetch(
		createURLWithParams<ApiTokenRequestParams>(
			API_TOKEN_URL,
			{
				grant_type: "authorization_code",
				...opts,
			},
		),
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
				Accept: "application/json",
			},
			method: "POST",
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
		private config: {
			readonly client_id: string;
			access_token: string;
			refresh_token: string;
		},
	) {}

	async getAccessToken(forceRefresh = false) {
		if (forceRefresh) {
			const data = await this.#refresh();
			this.config.refresh_token = data.refresh_token;
			this.config.access_token = data.access_token;
		}

		return this.config.access_token;
	}

	async #refresh() {
		const res = await fetch(
			createURLWithParams<ApiTokenRequestParams>(
				API_TOKEN_URL,
				{
					grant_type: "refresh_token",
					client_id: this.config.client_id,
					refresh_token: this.config.refresh_token,
				},
			),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
					Accept: "application/json",
				},
				method: "POST",
			},
		);

		if (!res.ok) {
			throw new Error(await res.text());
		}

		return (await res.json()) as KeypairResponse;
	}
}
