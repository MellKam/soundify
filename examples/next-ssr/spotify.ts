export const config = {
	client_id: process.env.SPOTIFY_CLIENT_ID!,
	client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
	redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
};

/** Name for cookie */
export const SPOTIFY_ACCESS_TOKEN = "SPOTIFY_ACCESS_TOKEN";
/** Name for cookie */
export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
/** Name for cookie */
export const SPOTIFY_STATE = "SPOTIFY_STATE";
