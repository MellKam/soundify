// dnt-shim-ignore
export const encodeToBase64 = (data: string): string => {
	return btoa(data);
};

export const getPKCECodeChallenge = async (
	code_verifier: string,
): Promise<string> => {
	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(code_verifier),
	);

	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
};
