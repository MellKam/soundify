import { Buffer } from "buffer";
import { createHash } from "crypto";

export const encodeToBase64 = (data: string): string => {
	return Buffer.from(data).toString("base64");
};

export const getPKCECodeChallenge = (
	code_verifier: string,
) => {
	return createHash("sha256").update(code_verifier).digest("base64url");
};
