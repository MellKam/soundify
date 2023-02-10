import { Buffer } from "node:buffer";

export const encodeBase64 = (data: string): string => {
	return Buffer.from(data).toString("base64");
};
