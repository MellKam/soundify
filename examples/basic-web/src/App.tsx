import { useEffect, useState } from "react";
import {
	getCurrentUserProfile,
	ImplicitGrantFlow,
	UserPrivate,
} from "soundify-web-api/web";

const authService = new ImplicitGrantFlow({
	SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

export const App = () => {
	const [userProfile, setUserProfile] = useState<UserPrivate | null>(null);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.hash.substring(1));

		const accessToken = searchParams.get("access_token");

		if (!accessToken) {
			const authURL = authService.getAuthURL({
				scopes: ["user-read-email"],
			});

			location.replace(authURL);
			return;
		}

		(async () => {
			const result = await getCurrentUserProfile(`Bearer ${accessToken}`);
			setUserProfile(result);
		})();
	}, []);

	return (
		<>
			{userProfile === null
				? (
					"Loading..."
				)
				: <div>Logged as {userProfile.display_name}</div>}
		</>
	);
};
