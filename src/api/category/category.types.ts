import { JSONObject, NonNullableJSON } from "../../shared";
import { Image } from "../general.types";

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
