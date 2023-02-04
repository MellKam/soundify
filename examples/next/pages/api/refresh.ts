import type { NextApiRequest, NextApiResponse } from "next";
import { AuthCodeService } from "soundify-web-api";
import { getCookie } from "cookies-next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const authService = new AuthCodeService({
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
		SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
	});

	const refreshToken = getCookie("SPOTIFY_REFRESH_TOKEN", {
		req,
		res,
		httpOnly: true,
	});

	if (typeof refreshToken !== "string") {
		res.status(400).send("Can't find SPOTIFY_REFRESH_TOKEN");
		return;
	}

	try {
		const data = await authService.getAccessByRefreshToken(refreshToken);
		res.json(data);
	} catch (error) {
		res.status(500).send(String(error));
	}
}
