import { Buffer } from "node:buffer";
import { createHash, randomBytes } from "node:crypto";

export const encodeToBase64 = (data: string): string =>
	Buffer.from(data).toString("base64");

export const getRandomBytes = (size: number): Uint8Array =>
	new Uint8Array(randomBytes(size));

// deno-lint-ignore require-await
export const getPKCECodeChallenge = async (
	code_verifier: string,
): Promise<string> => {
	return createHash("sha256").update(code_verifier).digest("base64url");
};
