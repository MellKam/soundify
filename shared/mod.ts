/**
 * The interface used to provide access token with the ability to refresh it
 */
export interface IAuthProvider {
	refresher(): Promise<string>;
	token?: string;
}

export type SearchParam = string | number | boolean | SearchParamArray;
export type SearchParamArray = SearchParam[];
export type SearchParams = { [k: string]: SearchParam | undefined };

/**
 * Creates a query string from the object and skips `undefined` values.
 */
export const toQueryString = <T extends SearchParams>(
	obj: T,
): string => {
	const params = new URLSearchParams();

	for (const [name, value] of Object.entries(obj)) {
		if (typeof value !== "undefined") params.set(name, value.toString());
	}

	return params.toString();
};
