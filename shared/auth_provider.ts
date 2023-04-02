/**
 * The interface used to provide access token with the ability to refresh it
 */
export interface IAuthProvider {
	refreshToken(): Promise<string>;
	readonly token: string | undefined;
}

interface ResponseWithAccess {
	access_token: string;
}

export type OnRefresh<T extends ResponseWithAccess> = (
	/**
	 * New authorization data that is returned after the update
	 */
	data: T,
) => void | Promise<void>;

export type OnRefreshFailure = (
	/**
	 * Error that occurred during the refresh
	 */
	error: Error,
) => void | Promise<void>;

export type AuthProviderOpts<T extends ResponseWithAccess> = {
	refresher: () => Promise<T>;
	access_token?: string;
	/**
	 * A callback event that is triggered after a successful refresh
	 */
	onRefreshSuccess?: OnRefresh<T>;
	/**
	 * The callback event that is triggered after a failed token refresh
	 */
	onRefreshFailure?: OnRefreshFailure;
};

export class AuthProvider<T extends ResponseWithAccess = ResponseWithAccess>
	implements IAuthProvider {
	constructor(
		private readonly opts: AuthProviderOpts<T>,
	) {}

	get token() {
		return this.opts.access_token;
	}

	async refreshToken() {
		try {
			const data = await this.opts.refresher();

			this.opts.access_token = data.access_token;
			if (this.opts.onRefreshSuccess) this.opts.onRefreshSuccess(data);
			return this.opts.access_token;
		} catch (error) {
			if (this.opts.onRefreshFailure) {
				this.opts.onRefreshFailure(error);
			}
			throw error;
		}
	}
}
