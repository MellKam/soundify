import { AuthCodeService } from "soundify-web-api";

export const authService = new AuthCodeService({
	SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
	SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
	SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
});
