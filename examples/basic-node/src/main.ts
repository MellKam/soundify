import { AuthorizationCodeFlow } from "soundify-web-api";
import { webcrypto } from "node:crypto";
import cookieParser from "cookie-parser";

import express from "express";
const app = express();
app.use(cookieParser("secret"));

const spotifyAuthService = new AuthorizationCodeFlow({
	SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
	SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
	SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
});

app.get("/login", (_req, res) => {
	const state = webcrypto.randomUUID();

	const redirectURL = spotifyAuthService.getAuthURL({
		scopes: ["user-read-email"],
		state,
	});

	res.cookie("state", state);
	res.redirect(redirectURL.toString());
});

app.get("/callback", async (req, res) => {
	const code = req.query["code"] as string | undefined;
	if (!code) {
		res.status(400).send("No code provided");
		return;
	}

	const state = req.cookies["state"];
	const expectedState = req.query["state"];

	if (!state || !expectedState || state != expectedState) {
		res.status(400).send("Wrong state");
		return;
	}

	const data = await spotifyAuthService.getKeypairByAuthCode(code);
	res.status(200).json(data);
});

const port = process.env.PORT;
app.listen(port, () => {
	console.log(
		`To get OAuth tokens, navigate to: http://localhost:${port}/login`,
	);
});
