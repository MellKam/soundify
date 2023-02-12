import { AccessTokenResponse } from "./auth.types.ts";

export class AuthProvider {
	#accessToken: string | null = null;
	#isExpired = true;
	#expireTimeoutId: number | null = null;
	#refresh: () => Promise<AccessTokenResponse>;

	constructor(
		{ refresh, access_token, expires_in }: {
			refresh: () => Promise<AccessTokenResponse>;
			access_token?: string;
			expires_in?: number;
		},
	) {
		this.#refresh = refresh;
		if (access_token) {
			this.#accessToken = access_token;
			this.#isExpired = false;
		}
		if (expires_in) {
			this.#expireTimeoutId = this.#expireTokenIn(expires_in);
		}
	}

	async call<T>(
		func: (accessToken: string) => Promise<T>,
	): Promise<T> {
		if (this.#accessToken === null || this.#isExpired) {
			try {
				const { access_token, expires_in } = await this.#refresh();
				this.#isExpired = false;
				this.#expireTimeoutId = this.#expireTokenIn(expires_in);
				this.#accessToken = access_token;
			} catch (error) {
				throw new Error(`Cannot refresh token: ${String(error)}`);
			}
		}
		return await func(this.#accessToken);
	}

	#expireTokenIn(delay: number) {
		return setTimeout(() => this.#isExpired = true, delay);
	}

	removeExpireListener() {
		if (!this.#expireTimeoutId) {
			throw new Error("expireTimeoutId in null");
		}
		clearTimeout(this.#expireTimeoutId);
	}
}

export interface IAuthProvider {
	call: <T>(func: (accessToken: string) => Promise<T>) => Promise<T>;
}
