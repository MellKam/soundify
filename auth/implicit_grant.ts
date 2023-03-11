import { searchParamsFromObj } from "../general.ts";
import { AUTHORIZE_URL, AuthScope } from "./consts.ts";
import { AccessResponse } from "./types.ts";
import { AuthorizeReqParams } from "./types.ts";

export type GetAuthURLOpts = {
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

export const getAuthURL = ({ scopes, ...opts }: GetAuthURLOpts) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = searchParamsFromObj<AuthorizeReqParams>({
		response_type: "token",
		scope: scopes?.join(" "),
		...opts,
	}).toString();

	return url;
};

// TODO rewrite in future
export const getGrantData = (urlHash: string, state?: string) => {
	const searchParams = new URLSearchParams(urlHash.substring(1));

	const error = searchParams.get("error");
	if (error) {
		throw new Error(error);
	}

	if (state) {
		const expectedState = searchParams.get("state");

		if (expectedState === null) {
			throw new Error("Can't find 'state' in query params");
		}

		if (state !== expectedState) {
			throw new Error("State from url does not match the passed state");
		}
	}

	const access_token = searchParams.get("access_token");
	const token_type = searchParams.get("token_type");
	const expires_in = Number(searchParams.get("expires_in"));

	if (isNaN(expires_in)) {
		throw new Error("Invalid 'expires_in' param");
	}

	if (!access_token || !token_type) {
		throw new Error("Cannot get params");
	}

	return {
		access_token,
		token_type,
		expires_in,
	} as AccessResponse;
};
