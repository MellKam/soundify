export type SearchParam = string | number | boolean | undefined | string[];
export type SearchParams = Record<string, SearchParam>;

/**
 * Creates URLSearchParams from object
 *
 * You can use `new URLSearchParams(obj)`, when your object
 * extends `Record<string, string>`. Otherwise use this function.
 */
export const objectToSearchParams = <
	T extends SearchParams,
>(
	obj: T,
): URLSearchParams => {
	const params = new URLSearchParams();

	Object.keys(obj).forEach((key) => {
		const value = obj[key];

		if (typeof value === "undefined") return;
		params.set(key, value.toString());
	});

	return params;
};

export type JSONValue =
	| null
	| string
	| number
	| boolean
	| JSONObject
	| JSONArray;

export type JSONArray = JSONValue[];
export interface JSONObject {
	[x: string]: JSONValue | undefined;
}

export type NonNullableJSON<T extends JSONObject> = {
	[K in keyof T]: NonNullable<T[K]>;
};

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FetchOpts {
	method?: HTTPMethod;
	body?: JSONValue;
	query?: SearchParams;
}

export type ExpectedResponse = "json" | "void";

/**
 * Interface that provides a fetch method to make HTTP requests.
 */
export interface HTTPClient {
	/**
	 * Sends an HTTP request.
	 *
	 * @param baseURL
	 * The base URL for the API request. Must begin with "/"
	 * @param returnType
	 * The expected return type of the API response.
	 * @param opts
	 * Optional request options, such as the request body or query parameters.
	 */
	fetch(
		baseURL: string,
		responseType: "void",
		opts?: FetchOpts,
	): Promise<void>;
	fetch<
		R extends JSONValue = JSONValue,
	>(
		baseURL: string,
		responseType: "json",
		opts?: FetchOpts,
	): Promise<R>;
}

/**
 * The interface used to provide access token with the ability to refresh it
 */
export interface IAuthProvider {
	/**
	 * Function that gives you access token.
	 */
	getAccessToken: (
		/**
		 * Does the service have to refresh the token, or give you a cached token
		 * @default false
		 */
		forceRefresh?: boolean,
	) => Promise<string>;
}
