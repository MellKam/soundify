import { encode } from "https://deno.land/std@0.175.0/encoding/base64.ts";

export const encodeBase64 = (data: string): string => encode(data);
