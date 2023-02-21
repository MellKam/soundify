import {
	CODE_VERIFIER,
	config,
	SPOTIFY_ACCESS_TOKNE,
	SPOTIFY_REFRESH_TOKEN,
} from "../spotify";
import { useNavigate } from "react-router-dom";
import { PKCEAuthCode } from "soundify-web-api/web";
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
				const { access_token, refresh_token } = await PKCEAuthCode.getGrantData(
					{
						code,
						code_verifier,
						client_id: config.client_id,
						redirect_uri: config.redirect_uri,
					},
				);

				localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
				localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);

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
