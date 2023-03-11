export type QueryParam = string | number | boolean | undefined | string[];
export type QueryParams = Record<string, QueryParam>;

/**
 * Creates URLSearchParams from object
 *
 * You can use `new URLSearchParams(obj)`, when your object
 * `extends Record<string, string>`. Otherwise use this function.
 */
export const searchParamsFromObj = <
	T extends Record<string, QueryParam>,
>(
	obj: T,
): URLSearchParams => {
	const searchParams = new URLSearchParams();

	Object.keys(obj).forEach((key) => {
		const value = obj[key];

		if (typeof value === "undefined") return;
		if (Array.isArray(value)) {
			searchParams.set(key, value.join(","));
		}

		searchParams.set(key, value.toString());
	});

	return searchParams;
};

export type JSONValue =
	| undefined
	| null
	| string
	| number
	| boolean
	| JSONObject
	| JSONArray;

export type JSONArray = Array<JSONValue>;

export interface JSONObject {
	[x: string]: JSONValue;
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FetchOpts {
	method?: HTTPMethod;
	body?: JSONValue;
	query?: QueryParams;
}

export interface HTTPClient {
	fetch(
		baseURL: string,
		returnType: "void",
		opts?: FetchOpts,
	): Promise<void>;
	fetch<
		R extends unknown,
	>(
		baseURL: string,
		returnType: "json",
		opts?: FetchOpts,
	): Promise<R>;
}

export interface IAuthProvider {
	/**
	 * Function that gives you Spotify access token.
	 */
	getAccessToken: (
		/**
		 * Should the service refresh the token
		 * @default false
		 */
		forceRefresh?: boolean,
	) => Promise<string>;
}
