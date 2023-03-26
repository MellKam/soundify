import { JSONObject, NonNullableJSON } from "api/general.types.ts";
import { Image } from "api/general.types.ts";

export interface Category extends JSONObject {
	/**
	 * A link to the Web API endpoint returning full details of the category.
	 */
	href: string;
	/**
	 * The category icon, in various sizes.
	 */
	icons: NonNullableJSON<Image>[];
	/**
	 * The Spotify category ID of the category.
	 */
	id: string;
	/**
	 * The name of the category.
	 */
	name: string;
}
