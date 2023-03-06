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

/**
 * Returns promise that will be resolved after specified delay
 * @param delay milliseconds
 */
export const wait = (delay: number) => {
	return new Promise<void>((res) => {
		setTimeout(res, delay);
	});
};

export type NonNullableRecord<T> = {
	[P in keyof T]: NonNullable<T[P]>;
};
