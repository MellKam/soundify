import type { NextApiRequest, NextApiResponse } from "next";
import { webcrypto } from "node:crypto";
import { setCookie } from "cookies-next";
import { authService, SPOTIFY_STATE } from "@/spotify/index.server";

export default function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const state = webcrypto.randomUUID();

	setCookie(SPOTIFY_STATE, state, {
		httpOnly: true,
		path: "/api/callback",
		req,
		res,
	});

	res.redirect(
		authService.getAuthURL({
			scopes: ["user-read-email"],
			state,
		}).toString(),
	);
}
