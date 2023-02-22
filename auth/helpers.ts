import { encodeToBase64 } from "../platform/platform.deno.ts";

export const getBasicAuthHeader = (
	CLIENT_ID: string,
	CLIENT_SECRET: string,
) => {
	return "Basic " +
		encodeToBase64(
			CLIENT_ID + ":" + CLIENT_SECRET,
		);
};
