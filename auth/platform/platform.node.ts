import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

export const encodeToBase64 = (data: string): string => {
	return Buffer.from(data).toString("base64");
};

// deno-lint-ignore require-await
export const getPKCECodeChallenge = async (
	code_verifier: string,
): Promise<string> => {
	return createHash("sha256").update(code_verifier).digest("base64url");
};
