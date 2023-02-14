import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie, setCookie } from "cookies-next";
import {
	authService,
	SPOTIFY_ACCESS_TOKEN,
	SPOTIFY_REFRESH_TOKEN,
} from "@/spotify/index.server";

export default async function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const refreshToken = getCookie(SPOTIFY_REFRESH_TOKEN, {
		req,
		res,
	});

	if (typeof refreshToken !== "string") {
		res.status(400).send({ error: "Can't find SPOTIFY_REFRESH_TOKEN" });
		return;
	}

	try {
		const { access_token, expires_in } = await authService
			.refreshAccessToken(
				refreshToken,
			);

		setCookie(SPOTIFY_ACCESS_TOKEN, access_token, {
			maxAge: expires_in,
			req,
			res,
			sameSite: "strict",
		});

		res.status(200).send("OK");
	} catch (error) {
		res.status(500).send({ error: String(error) });
	}
}
