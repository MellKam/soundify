import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";

export const encodeBase64 = (data: string): string => {
	return Buffer.from(data).toString("base64");
};

export const getRandomHexString = (length: number): string => {
	return randomBytes(length).toString("hex");
};
