import { encode as encodeBase64 } from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { encode as encodeBase64URL } from "https://deno.land/std@0.177.0/encoding/base64url.ts";

export const encodeToBase64 = (data: string): string => encodeBase64(data);

export const getPKCECodeChallenge = async (
	codeVerifier: string,
): Promise<string> => {
	const buffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(codeVerifier),
	);

	return encodeBase64URL(buffer);
};
