import { useMemo } from "react";
import { PKCEAuthCode, SpotifyClient } from "soundify-web-api/web";

export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const SPOTIFY_ACCESS_TOKNE = "SPOTIFY_ACCESS_TOKEN";
export const CODE_VERIFIER = "CODE_VERIFIER";

export const config = {
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
};

export const useSpotifyClient = () => {
	return useMemo(() => {
		const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);
		const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);

		if (
			!refresh_token
		) {
			return null;
		}

		const authProvider = new PKCEAuthCode.AuthProvider({
			client_id: config.client_id,
			refresh_token: refresh_token!,
			access_token: access_token ? access_token : undefined,
			saveAccessToken: (access_token) => {
				localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
			},
			saveRefreshToken: (refresh_token) => {
				localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			},
		});

		return new SpotifyClient({ authProvider });
	}, []);
};

export const authorize = async () => {
	const { code_challenge, code_verifier } = await PKCEAuthCode.generateCodes();
	localStorage.setItem(CODE_VERIFIER, code_verifier);

	location.replace(PKCEAuthCode.getAuthURL({
		client_id: config.client_id,
		code_challenge: code_challenge,
		redirect_uri: config.redirect_uri,
		scopes: ["user-read-email"],
	}));
};
