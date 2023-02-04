import type { NextApiRequest, NextApiResponse } from "next";
import { AuthCodeService } from "soundify-web-api";
import { webcrypto } from "node:crypto";
import { setCookie } from "cookies-next";

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const authService = new AuthCodeService({
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
		SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
	});

	const state = webcrypto.randomUUID();

	setCookie("state", state, {
		httpOnly: true,
		path: "/api/callback",
		req,
		res,
	});

	const url = authService.getAuthURL({
		scopes: ["user-read-email"],
		state,
	});

	res.redirect(url.toString());
}
