import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie, setCookie } from "cookies-next";
import { AuthCode } from "soundify-web-api";
import {
	config,
	SPOTIFY_ACCESS_TOKEN,
	SPOTIFY_REFRESH_TOKEN,
} from "../../spotify";

export default async function (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const refresh_token = getCookie(SPOTIFY_REFRESH_TOKEN, {
		req,
		res,
	});

	if (typeof refresh_token !== "string") {
		res.status(400).send({ error: "Can't find SPOTIFY_REFRESH_TOKEN" });
		return;
	}

	try {
		const authProvider = new AuthCode.AuthProvider({
			...config,
			refresh_token,
		});
		const { access_token, expires_in } = await authProvider.refresh();

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
