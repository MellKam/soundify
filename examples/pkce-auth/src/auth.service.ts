import { PKCECodeService } from "soundify-web-api/web";

export const authService = new PKCECodeService({
	SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const SPOTIFY_ACCESS_TOKNE = "SPOTIFY_ACCESS_TOKEN";
export const SPOTIFY_EXPIRES_TIME = "SPOTIFY_EXPIRES_TIME";
export const CODE_VERIFIER = "CODE_VERIFIER";
