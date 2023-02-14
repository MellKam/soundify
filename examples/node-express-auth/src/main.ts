import { AuthCodeService } from "soundify-web-api";
import { webcrypto } from "node:crypto";
import cookieParser from "cookie-parser";

import express from "express";
const app = express();
app.use(cookieParser("secret"));

const authService = new AuthCodeService({
	SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
	SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
	SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
});

app.get("/login", (_req, res) => {
	const state = webcrypto.randomUUID();

	res.cookie("state", state);
	res.redirect(
		authService.getAuthURL({
			scopes: ["user-read-email"],
			state,
		}).toString(),
	);
});

app.get("/callback", async (req, res) => {
	const state = req.cookies["state"];
	if (!state) {
		res.status(400).send("Can't find state");
		return;
	}

	try {
		const keypairData = await authService.getGrantData(
			new URL(req.url, `http://${req.headers.host}`).searchParams,
			state,
		);

		res.status(200).json(keypairData);
	} catch (error) {
		res.status(400).send(String(error));
	}
});

const port = process.env.PORT;
app.listen(port, () => {
	console.log(
		`To get OAuth tokens, navigate to: http://localhost:${port}/login`,
	);
});
