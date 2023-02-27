export interface Followers {
	/**
	 * This will always be set to null, as the Web API does not support it at the moment.
	 */
	href: string | null;
	/**
	 * The total number of followers.
	 */
	total: number;
}
