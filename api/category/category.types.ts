import { NonNullableRecord } from "../../utils.ts";
import { Image } from "../shared.ts";

export interface Category {
	/**
	 * A link to the Web API endpoint returning full details of the category.
	 */
	href: string;
	/**
	 * The category icon, in various sizes.
	 */
	icons: NonNullableRecord<Image>[];
	/**
	 * The Spotify category ID of the category.
	 */
	id: string;
	/**
	 * The name of the category.
	 */
	name: string;
}
