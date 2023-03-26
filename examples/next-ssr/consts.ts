export const env = {
	client_id: process.env.SPOTIFY_CLIENT_ID!,
	client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
	redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
};

/** Names for cookies */
export const ACCESS_TOKEN = "SPOTIFY_ACCESS_TOKEN";
export const REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const STATE = "SPOTIFY_STATE";
