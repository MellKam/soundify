import {
	authService,
	CODE_VERIFIER,
	SPOTIFY_ACCESS_TOKNE,
	SPOTIFY_EXPIRES_TIME,
	SPOTIFY_REFRESH_TOKEN,
} from "../auth.service";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const Page = () => {
	const code = new URLSearchParams(location.search).get("code");
	if (!code) {
		return <div>Invalid search params. Cannot find "code"</div>;
	}

	const code_verifier = localStorage.getItem(CODE_VERIFIER);
	if (!code_verifier) {
		return <div>Cannot find code verifier</div>;
	}

	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				const data = await authService.getGrantData(code, code_verifier);

				const expiresTime = new Date().getTime() + data.expires_in * 1000;

				localStorage.setItem(SPOTIFY_REFRESH_TOKEN, data.refresh_token);
				localStorage.setItem(SPOTIFY_ACCESS_TOKNE, data.access_token);
				localStorage.setItem(SPOTIFY_EXPIRES_TIME, expiresTime.toString());

				navigate("/");
			} catch (err) {
				if (error === null) setError(String(err));
			}
		})();
	}, []);

	return (
		<>
			{error ? <h1>{error}</h1> : <h1>Authorized</h1>}
		</>
	);
};
