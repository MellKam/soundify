import { searchParamsFromObj } from "../utils.ts";
import { AUTHORIZE_URL, AuthScope } from "./consts.ts";
import { AccessTokenResponse } from "./types.ts";
import { AuthorizeReqParams } from "./types.ts";

export const getAuthURL = ({ scopes, ...rest }: {
	client_id: string;
	scopes?: AuthScope[];
	redirect_uri: string;
	show_dialog?: boolean;
	state?: string;
}) => {
	const url = new URL(AUTHORIZE_URL);

	url.search = searchParamsFromObj<AuthorizeReqParams>({
		response_type: "token",
		scope: scopes?.join(" "),
		...rest,
	}).toString();

	return url;
};

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
	} as AccessTokenResponse;
};
