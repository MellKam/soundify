export type RequireAtLeastOne<T> = {
	[K in keyof T]-?:
		& Required<Pick<T, K>>
		& Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type Prettify<T> =
	& {
		[K in keyof T]: T[K];
	}
	// deno-lint-ignore ban-types
	& {};
