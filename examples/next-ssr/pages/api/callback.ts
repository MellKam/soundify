import { getCookie, setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";
import {
	authService,
	SPOTIFY_ACCESS_TOKEN,
	SPOTIFY_REFRESH_TOKEN,
	SPOTIFY_STATE,
} from "@/spotify/index.server";

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

	try {
		const { refresh_token, access_token } = await authService
			.getGrantData(url.searchParams, state);

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
			sameSite: "strict",
		});

		res.redirect("/");
	} catch (error) {
		res.status(400).send({ error: String(error) });
	}
}
