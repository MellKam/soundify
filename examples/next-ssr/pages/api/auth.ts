import type { NextApiRequest, NextApiResponse } from "next";
import { webcrypto } from "node:crypto";
import { setCookie } from "cookies-next";
import { AuthCode } from "soundify-web-api";
import { env, SPOTIFY_STATE } from "../../spotify";

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
		AuthCode.getAuthURL({
			scopes: ["user-read-email"],
			state,
			client_id: env.client_id,
			redirect_uri: env.redirect_uri,
		}).toString(),
	);
}
