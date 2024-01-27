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
	| string[]
	| number[]
	| boolean[]
	| undefined;
export type SearchParams = Record<string, SearchParam>;

export type Prettify<T> =
	& {
		[K in keyof T]: T[K];
	}
	// deno-lint-ignore ban-types
	& {};
