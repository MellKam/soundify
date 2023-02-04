import { useEffect, useState } from "react";
import {
	getCurrentUserProfile,
	ImplicitGrantService,
	UserPrivate,
} from "soundify-web-api/web";

const authService = new ImplicitGrantService({
	SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

const useSpotifyProfile = () => {
	const [userProfile, setUserProfile] = useState<UserPrivate | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (userProfile !== null) return;

		try {
			const { access_token } = authService.getGrantData(location.hash);

			(async () => {
				try {
					const user = await getCurrentUserProfile(access_token);
					setUserProfile(user);
				} catch (error) {
					setError(String(error));
				}
			})();
		} catch (error) {
			const authURL = authService.getAuthURL({
				scopes: ["user-read-email"],
			});

			location.replace(authURL);
		}
	}, []);

	return { userProfile, error };
};

export const App = () => {
	const { userProfile, error } = useSpotifyProfile();

	return (
		<>
			{error
				? <h1>{error}</h1>
				: userProfile === null
				? <div>Redirecting to login...</div>
				: <h1>Welcome {userProfile.display_name}!</h1>}
		</>
	);
};
