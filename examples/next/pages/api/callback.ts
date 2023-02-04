import { getCookie, setCookie } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";
import { AuthCodeService, KeypairResponse } from "soundify-web-api";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<KeypairResponse | string>,
) {
	const authService = new AuthCodeService({
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
		SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
	});

	const state = getCookie("state", { httpOnly: true, req, res });
	if (typeof state !== "string") {
		res.status(400).send("Cannot get state from cookies");
		return;
	}

	if (!req.url) {
		res.status(400).send("req.url in undefined");
		return;
	}
	const url = new URL(req.url, `http://${req.headers.host}`);

	try {
		const keypairData = await authService.getGrantData(url.searchParams, state);

		setCookie("SPOTIFY_ACCESS_TOKEN", keypairData.access_token, {
			sameSite: "strict",
			req,
			res,
		});

		setCookie("SPOTIFY_REFRESH_TOKEN", keypairData.refresh_token, {
			httpOnly: true,
			sameSite: "strict",
			path: "/api/refresh",
			req,
			res,
		});

		res.redirect("/");
	} catch (error) {
		res.status(400).send(String(error));
	}
}
