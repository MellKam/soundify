import type { ExternalUrls, Followers, Image } from "../general.types.ts";

/**
 * The spotify api object containing details of a user's public details.
 */
export interface PublicUser {
	/** @description The name displayed on the user's profile. `null` if not available. */
	display_name: string | null;
	/** @description Known public external URLs for this user. */
	external_urls: ExternalUrls;
	/** @description Information about the followers of this user. */
	followers: Followers;
	/** @description A link to the Web API endpoint for this user. */
	href: string;
	/** @description The [Spotify user ID](/documentation/web-api/concepts/spotify-uris-ids) for this user. */
	id: string;
	/** @description The object type. */
	type: "user";
	/** @description The user's profile image. */
	images: Image[];
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for this user. */
	uri: string;
}

/**
 * The spotify api object containing the information of explicit content.
 */
export type ExplicitContentSettings = {
	/** @description When `true`, indicates that explicit content should not be played. */
	filter_enabled: boolean;
	/** @description When `true`, indicates that the explicit content setting is locked and can't be changed by the user. */
	filter_locked: boolean;
};

/**
 * The spotify api object containing details of a user's public and private details.
 *
 * For complete information, you might consider including scopes: `user-read-private`, `user-read-email`.
 */
export interface PrivateUser {
	/** @description The country of the user, as set in the user's account profile. An [ISO 3166-1 alpha-2 country code](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
	 *
	 *  _This field is only available when the current user has granted access to the [user-read-private](/documentation/web-api/concepts/scopes/#list-of-scopes) scope._ */
	country?: string;
	/** @description The user's email address, as entered by the user when creating their account.
	 *
	 * _**Important!** This email address is unverified; there is no proof that it actually belongs to the user._
	 *
	 * _This field is only available when the current user has granted access to the [user-read-email](/documentation/web-api/concepts/scopes/#list-of-scopes) scope._ */
	email?: string;
	/** @description The user's explicit content settings.
	 *
	 * _This field is only available when the current user has granted access to the [user-read-private](/documentation/web-api/concepts/scopes/#list-of-scopes) scope._ */
	explicit_content?: ExplicitContentSettings;
	/** @description Known external URLs for this user. */
	external_urls?: ExternalUrls;
	/** @description Information about the followers of the user. */
	followers?: Followers;
	/** @description A link to the Web API endpoint for this user. */
	href: string;
	/** @description The [Spotify user ID](/documentation/web-api/concepts/spotify-uris-ids) for the user. */
	id: string;
	/** @description The user's profile image. */
	images: Image[];
	/** @description The user's Spotify subscription level: "premium", "free", etc. (The subscription level "open" can be considered the same as "free".)
	 *
	 * _This field is only available when the current user has granted access to the [user-read-private](/documentation/web-api/concepts/scopes/#list-of-scopes) scope._ */
	product?: "free" | "open" | "premium";
	/** @description The object type: "user" */
	type?: "user";
	/** @description The [Spotify URI](/documentation/web-api/concepts/spotify-uris-ids) for the user. */
	uri?: string;
}
