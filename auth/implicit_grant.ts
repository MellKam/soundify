import { toQueryString } from "shared/mod.ts";
import { AuthorizeReqParams, AuthScope, SPOTIFY_AUTH } from "auth/general.ts";

export type GetRedirectURLOpts = {
	/**
	 * List of scopes.
	 *
	 * @default
	 * If no scopes are specified, authorization will be granted
	 * only to access publicly available information
	 */
	scopes?: AuthScope[];
	/**
	 * Whether or not to force the user to approve the app again
	 * if they’ve already done so.
	 *
	 * - If false, a user who has already approved the application
	 *  may be automatically redirected to the URI specified by `redirect_uri`.
	 * - If true, the user will not be automatically redirected and will have
	 *  to approve the app again.
	 *
	 * @default false
	 */
	show_dialog?: boolean;
	/**
	 * This provides protection against attacks such as
	 * cross-site request forgery.
	 */
	state?: string;
};

export interface CallbackErrorData extends Record<string, string | undefined> {
	/**
	 * The reason authorization failed, for example: “access_denied”.
	 */
	error: string;
	/**
	 * The value of the state parameter supplied in the request.
	 */
	state?: string;
}

export interface CallbackSuccessData
	extends Record<string, string | undefined> {
	/**
	 * An access token that can be provided in subsequent calls, for example to Spotify Web API services.
	 */
	access_token: string;
	token_type: "Bearer";
	/**
	 * The time period (in seconds) for which the access token is valid.
	 */
	expires_in: string;
	/**
	 * The value of the state parameter supplied in the request.
	 */
	state?: string;
}

export type CallbackData = CallbackSuccessData | CallbackErrorData;

export class ImplicitGrant {
	constructor(
		private readonly creds: {
			/**
			 * The Client ID generated after registering your Spotify application.
			 */
			client_id: string;
			/**
			 * The URI to redirect to after the user grants or denies permission.
			 */
			redirect_uri: string;
		},
	) {}

	getRedirectURL({ scopes, ...opts }: GetRedirectURLOpts) {
		const url = new URL(SPOTIFY_AUTH + "authorize");

		url.search = toQueryString<AuthorizeReqParams>({
			response_type: "token",
			scope: scopes?.join(" "),
			...this.creds,
			...opts,
		});

		return url;
	}

	static parseCallbackData(hash: string) {
		const params = Object.fromEntries(
			new URLSearchParams(hash.substring(1)),
		) as CallbackData;

		if ("error" in params) return params;
		if (
			"access_token" in params && "expires_in" in params &&
			"token_type" in params
		) {
			return params;
		}

		throw new Error("Invalid params");
	}
}
