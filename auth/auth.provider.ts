import { AccessTokenResponse } from "./auth.types.ts";

type RefreshFn = () => Promise<AccessTokenResponse>;

export class AuthProvider implements IAuthProvider {
	#accessToken: string | null = null;
	#isExpired = true;
	#expireTimeoutId: ReturnType<typeof setTimeout> | null = null;
	#refresh: RefreshFn;

	constructor(
		{ refresh, access_token, expires_in }: {
			refresh: RefreshFn;
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

export class ImplicitAuthProvider implements IAuthProvider {
	#accessToken: string;
	#refresh: () => void;

	constructor({ refresh, access_token }: {
		refresh: () => void;
		access_token: string;
	}) {
		this.#refresh = refresh;
		this.#accessToken = access_token;
	}

	async call<T>(func: (accessToken: string) => Promise<T>) {
		try {
			return await func(this.#accessToken);
		} catch (_) {
			this.#refresh();
			throw new Error("error");
		}
	}
}

export interface IAuthProvider {
	call: <T>(func: (accessToken: string) => Promise<T>) => Promise<T>;
}
