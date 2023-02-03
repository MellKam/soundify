import { encodeBase64 } from "../platform.deno.ts";
import { createURLWithParams } from "../utils.ts";
import { API_TOKEN_URL } from "./auth.consts.ts";
import { ApiTokenRequestParams } from "./auth.types.ts";

export const getBasicAuthHeader = (
	CLIENT_ID: string,
	CLIENT_SECRET: string,
) => {
	return "Basic " +
		encodeBase64(
			CLIENT_ID + ":" + CLIENT_SECRET,
		);
};

export const postApiTokenRoute = (
	basicAuthHeader: string,
	body: ApiTokenRequestParams,
) => {
	return fetch(
		createURLWithParams<ApiTokenRequestParams>(
			API_TOKEN_URL,
			body,
		),
		{
			headers: {
				Authorization: basicAuthHeader,
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			method: "POST",
		},
	);
};
