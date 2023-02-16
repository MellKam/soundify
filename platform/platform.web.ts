export const encodeToBase64 = (data: string): string => {
	return window.btoa(data);
};

export const getPKCECodeChallenge = async (
	codeVerifier: string,
): Promise<string> => {
	const buffer = await window.crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(codeVerifier),
	);

	return window.btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
};
