import { encodeToBase64 } from "../platform/platform.deno.ts";
import { IAuthProvider } from "./types.ts";

export const getBasicAuthHeader = (
	CLIENT_ID: string,
	CLIENT_SECRET: string,
) => {
	return "Basic " +
		encodeToBase64(
			CLIENT_ID + ":" + CLIENT_SECRET,
		);
};

export class PureAuthProvider implements IAuthProvider {
	constructor(private readonly access_token: string) {}

	// deno-lint-ignore require-await
	async getAccessToken() {
		return this.access_token;
	}
}
