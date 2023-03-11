import { AuthCode } from "@soundify/node";
import { randomUUID } from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser("secret"));

const config = {
	client_id: process.env.SPOTIFY_CLIENT_ID!,
	client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
	redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
};

app.get("/login", (_, res) => {
	const state = randomUUID();

	res.cookie("state", state, {
		httpOnly: true,
	});
	res.redirect(
		AuthCode.getAuthURL({
			scopes: ["user-read-email"],
			state,
			client_id: config.client_id,
			redirect_uri: config.redirect_uri,
		}).toString(),
	);
});

app.get("/callback", async (req, res) => {
	const state = req.cookies["state"];
	if (!state) {
		res.status(400).send("Can't find state");
		return;
	}

	const searchParams =
		new URL(req.url, `http://${req.headers.host}`).searchParams;
	const code = searchParams.get("code");
	if (!code) {
		res.status(400).send("Can't find code");
		return;
	}

	try {
		const grantData = await AuthCode.getGrantData({
			code,
			...config,
		});

		res.status(200).json(grantData);
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
