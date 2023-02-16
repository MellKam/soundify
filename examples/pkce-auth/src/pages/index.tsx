import { useEffect } from "react";
import {
	authService,
	CODE_VERIFIER,
	SPOTIFY_ACCESS_TOKNE,
	SPOTIFY_EXPIRES_TIME,
	SPOTIFY_REFRESH_TOKEN,
} from "../auth.service";

const authorize = async () => {
	const code_verifier = authService.generateCodeVerifier();
	const code_challenge = await authService.getCodeChallenge(code_verifier);

	const authURL = authService.getAuthURL({
		scopes: ["user-read-email"],
		code_challenge,
	});

	localStorage.setItem(CODE_VERIFIER, code_verifier);
	location.replace(authURL);
};

export const Page = () => {
	const expiresTime = localStorage.getItem(SPOTIFY_EXPIRES_TIME);
	const accessToken = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);

	if (
		!expiresTime || !accessToken
	) {
		authorize();
		return <div>Authorizing...</div>;
	}

	useEffect(() => {
		if (new Date().getTime() > Number(expiresTime)) {
			const refreshToken = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);

			if (refreshToken) {
				(async () => {
					const data = await authService.refreshAccessToken(refreshToken);

					console.log(data);
				})();
			}
		}
	}, []);

	return <div>Authorized</div>;
};
