import type { NonNullableObject } from "../shared.ts";
import type { Image } from "../general.types.ts";

export type Category = {
	/**
	 * A link to the Web API endpoint returning full details of the category.
	 */
	href: string;
	/**
	 * The category icon, in various sizes.
	 */
	icons: NonNullableObject<Image>[];
	/**
	 * The Spotify category ID of the category.
	 */
	id: string;
	/**
	 * The name of the category.
	 */
	name: string;
};
