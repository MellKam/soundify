export type QueryParam = string | number | boolean | undefined | string[];
export type QueryParams = Record<string, QueryParam>;

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
