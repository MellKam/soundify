import { encodeToBase64 } from "auth/platform/platform.deno.ts";

export const getBasicAuthHeader = (
	clientId: string,
	clientSecret: string,
) => {
	return "Basic " +
		encodeToBase64(
			clientId + ":" + clientSecret,
		);
};
