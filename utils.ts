export const searchParamsFromObj = <
	T extends Record<string, string | number | boolean | undefined>,
>(
	obj: T,
): URLSearchParams => {
	const searchParams = new URLSearchParams();

	Object.keys(obj).forEach((key) => {
		const value = obj[key];
		if (typeof value !== "undefined") {
			searchParams.set(key, value.toString());
		}
	});

	return searchParams;
};
