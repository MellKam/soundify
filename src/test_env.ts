import { cleanEnv, str } from "envalid";
import { SpotifyClient } from "./api/client";
import { AuthCodeFlow } from "./auth/auth_code";

export const env = cleanEnv(process.env, {
  SPOTIFY_CLIENT_ID: str(),
  SPOTIFY_CLIENT_SECRET: str(),
  // Authorization code refresh token with all scopes
  SPOTIFY_REFRESH_TOKEN: str()
});

export const client = new SpotifyClient(
  new AuthCodeFlow({
    client_id: env.SPOTIFY_CLIENT_ID,
    client_secret: env.SPOTIFY_CLIENT_SECRET
  }).createAuthProvider(env.SPOTIFY_REFRESH_TOKEN)
);
