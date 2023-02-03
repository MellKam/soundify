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

	useEffect(() => {
		if (userProfile !== null) return;

		try {
			const { access_token } = authService.getGrantData(location.hash);

			(async () => {
				const result = await getCurrentUserProfile(`Bearer ${access_token}`);
				setUserProfile(result);
			})();
		} catch (error) {
			const authURL = authService.getAuthURL({
				scopes: ["user-read-email"],
			});

			location.replace(authURL);
		}
	}, []);

	return userProfile;
};

export const App = () => {
	const userProfile = useSpotifyProfile();

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
