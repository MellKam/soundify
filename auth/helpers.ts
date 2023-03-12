import { encodeToBase64 } from "auth/platform/platform.deno.ts";

export const getBasicAuthHeader = (
	client_id: string,
	client_secret: string,
) => {
	return "Basic " +
		encodeToBase64(
			client_id + ":" + client_secret,
		);
};
