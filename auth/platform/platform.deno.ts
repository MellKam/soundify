import { encode as encodeBase64 } from "https://deno.land/std@0.178.0/encoding/base64.ts";
import { encode as encodeBase64URL } from "https://deno.land/std@0.178.0/encoding/base64url.ts";

export const encodeToBase64 = (data: string): string => encodeBase64(data);

export const getRandomBytes = (size: number) =>
	crypto.getRandomValues(new Uint8Array(size));

export const getPKCECodeChallenge = async (
	code_verifier: string,
): Promise<string> => {
	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(code_verifier),
	);

	return encodeBase64URL(buffer);
};
