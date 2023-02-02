import { encodeBase64 } from "../platform.deno.ts";

export const getBasicAuthHeader = (
	CLIENT_ID: string,
	CLIENT_SECRET: string,
) => {
	return "Basic " +
		encodeBase64(
			CLIENT_ID + ":" + CLIENT_SECRET,
		);
};
