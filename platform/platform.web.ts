export const encodeBase64 = (data: string): string => window.btoa(data);

/**
 * Decimal number to hex string
 * If the result is one character, zero is added to the beginning
 *
 * @example
 * 0 => "00"
 * 12 => "0c"
 * 16 => "10"
 */
const decToHex = (dec: number): string => dec.toString(32).padStart(2, "0");

/**
 * Returns random hex string with given length
 *
 * @example getRandomHexString(20) => "9c7f5f825b79eacd4134"
 */
export const getRandomHexString = (length: number): string => {
	return Array
		.from(
			window.crypto.getRandomValues(new Uint32Array(length / 2)),
			decToHex,
		)
		.join("");
};

export const sha256 = async (data: string): Promise<string> => {
	const buffer = await window.crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(data),
	);
	return String.fromCharCode(...new Uint8Array(buffer));
};

export const base64URLEncode = (data: string): string => {
	return window.btoa(data)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
};
