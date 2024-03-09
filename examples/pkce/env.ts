import { z } from "zod";
import { load } from "std/dotenv/mod.ts";

await load({ export: true });

export const env = z
	.object({
		SPOTIFY_CLIENT_ID: z.string(),
		// we don't need the client secret for PKCE
		// so this is safe to use in the browser
		SPOTIFY_REDIRECT_URI: z.string().url(),
	})
	.parse(Deno.env.toObject());
