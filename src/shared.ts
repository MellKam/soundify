/**
 * The interface used to provide access token with the ability to refresh it
 */
export interface IAuthProvider {
  refresh: () => Promise<string>;
  token?: string;
}

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONArray
  | JSONObject;
export type JSONArray = JSONValue[];
export interface JSONObject {
  [x: string]: JSONValue | undefined;
}

export type NonNullableJSON<T extends JSONObject> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type SearchParam =
  | string
  | number
  | boolean
  | readonly string[]
  | readonly number[]
  | readonly boolean[];
export interface SearchParams {
  [k: string]: SearchParam | undefined;
}

/**
 * Creates a query string from the object and skips `undefined` values.
 */
export const toQueryString = <T extends SearchParams>(obj: T): string => {
  const params = new URLSearchParams();

  for (const key in obj) {
    const value = obj[key] as SearchParam | undefined;
    if (typeof value !== "undefined") params.set(key, value.toString());
  }

  return params.toString();
};

/**
 * Attempts to parse response body as json and return it, otherwise returns response as string.
 * If the response body is null or empty, it returns an empty string.
 */
export const parseResponse = async <T extends JSONValue = JSONValue>(
  res: Response
): Promise<T | string> => {
  let text = "";
  try {
    text = await res.text();
    if (!text) return text;
    return JSON.parse(text) as T;
  } catch (_) {
    return text;
  }
};
