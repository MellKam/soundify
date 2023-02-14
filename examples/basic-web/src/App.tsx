import { useEffect, useState } from "react";
import {
	getCurrentUserProfile,
	ImplicitGrantService,
	SpotifyClient,
	UserPrivate,
} from "soundify-web-api/web";

const authService = new ImplicitGrantService({
	SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

const authURL = authService.getAuthURL({
	scopes: ["user-read-email"],
});

const SPOTIFY_ACCESS_TOKEN = "SPOTIFY_ACCESS_TOKEN";

const useSpotifyClient = () => {
	if (location.pathname === "/callback") {
		const { access_token } = authService.getGrantData(location.hash);
		localStorage.setItem(SPOTIFY_ACCESS_TOKEN, access_token);
		location.replace("/");
	}

	const accessToken = localStorage.getItem(SPOTIFY_ACCESS_TOKEN);

	if (!accessToken) {
		location.replace(authURL);
	}

	return new SpotifyClient({
		access_token: accessToken!,
	});
};

const useSpotifyProfile = (authProvider: SpotifyClient) => {
	const [userProfile, setUserProfile] = useState<UserPrivate | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		(async () => {
			try {
				const user = await getCurrentUserProfile(authProvider);
				setUserProfile(user);
			} catch (error) {
				setError(String(error));
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return { userProfile, error, isLoading };
};

export const App = () => {
	const spotifyClient = useSpotifyClient();
	const { userProfile, error, isLoading } = useSpotifyProfile(spotifyClient);

	if (isLoading) {
		return <h1>Loading...</h1>;
	}

	if (error || !userProfile) {
		return <h1>{error ?? "Unexpected error"}</h1>;
	}

	return <h1>Welcome {userProfile.display_name}!</h1>;
};
