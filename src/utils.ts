export const createURLWithParams = <
  T extends Record<string, string | number | boolean | undefined>,
>(
  baseURL: string,
  searchParams: T,
): URL => {
  const url = new URL(baseURL);

  Object.keys(searchParams).forEach((key) => {
    const value = searchParams[key];
    if (value) {
      url.searchParams.set(key, value.toString());
    }
  });

  return url;
};
