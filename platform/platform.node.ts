import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

export const encodeToBase64 = (data: string): string => {
	return Buffer.from(data).toString("base64");
};

export const getPKCECodeChallenge = (
	codeVerifier: string,
) => {
	return createHash("sha256").update(codeVerifier).digest("base64url");
};
