import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { setCookie } from "cookies-next";
import { AuthCode } from "@soundify/node-auth";
import { env, STATE } from "../../consts";

export default function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const state = randomUUID();

	setCookie(STATE, state, {
		httpOnly: true,
		path: "/api/callback",
		req,
		res,
	});

	res.redirect(
		AuthCode.getRedirectURL({
			scopes: ["user-read-email"],
			state,
			client_id: env.client_id,
			redirect_uri: env.redirect_uri,
		}).toString(),
	);
}
