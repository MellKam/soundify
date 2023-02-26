import { getCookie, setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";
import { AuthCode } from "soundify-web-api";
import {
	config,
	SPOTIFY_ACCESS_TOKEN,
	SPOTIFY_REFRESH_TOKEN,
	SPOTIFY_STATE,
} from "../../spotify";

export default async function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const state = getCookie(SPOTIFY_STATE, { req, res });
	if (typeof state !== "string") {
		res.status(400).send({ error: "Cannot get state from cookies" });
		return;
	}

	if (!req.url) {
		res.status(400).send({ error: "req.url in undefined" });
		return;
	}
	const url = new URL(req.url, `http://${req.headers.host}`);
	const code = url.searchParams.get("code");
	if (!code) {
		res.status(400).send({ error: "Cannot find `code` in search params" });
		return;
	}

	try {
		const { refresh_token, access_token, expires_in } = await AuthCode
			.getGrantData({
				code,
				state,
				...config,
			});

		setCookie(SPOTIFY_REFRESH_TOKEN, refresh_token, {
			httpOnly: true,
			sameSite: "strict",
			path: "/api/refresh",
			req,
			res,
		});

		setCookie(SPOTIFY_ACCESS_TOKEN, access_token, {
			req,
			res,
			maxAge: expires_in,
			sameSite: "strict",
		});

		res.redirect("/");
	} catch (error) {
		res.status(400).send({ error: String(error) });
	}
}
