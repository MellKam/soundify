import { AuthCodeFlow } from "@soundify/web-api";
import { randomUUID } from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser("secret"));

const env = {
  client_id: process.env.SPOTIFY_CLIENT_ID!,
  client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
};

const authFlow = new AuthCodeFlow({
  client_id: env.client_id,
  client_secret: env.client_secret
});

app.get("/login", (_, res) => {
  const state = randomUUID();

  res.cookie("state", state, {
    httpOnly: true
  });
  res.redirect(
    authFlow
      .getAuthURL({
        scopes: ["user-read-email"],
        state,
        redirect_uri: env.redirect_uri
      })
      .toString()
  );
});

app.get("/callback", async (req, res) => {
  try {
    const searchParams = new URL(req.url, `http://${req.headers.host}`)
      .searchParams;
    const data = AuthCodeFlow.parseCallbackData(searchParams);
    if ("error" in data) {
      throw new Error(data.error);
    }

    const storedState = req.cookies["state"];
    if (!storedState || !data.state || storedState !== data.state) {
      throw new Error("Unable to verify request with state.");
    }

    const grantData = await authFlow.getGrantData(env.redirect_uri, data.code);

    res.status(200).json(grantData);
  } catch (error) {
    res.status(400).send(String(error));
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(
    `To get OAuth tokens, navigate to: http://localhost:${port}/login`
  );
});
