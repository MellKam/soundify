import { useQuery } from "@tanstack/react-query";
import {
	getCurrentUserProfile,
	ImplicitGrant,
	SpotifyClient,
} from "soundify-web-api/web";

const useSpotifyClient = () => {
	const accessToken = localStorage.getItem("SPOTIFY_ACCESS_TOKEN");

	if (!accessToken) {
		location.replace(ImplicitGrant.getAuthURL({
			client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
			redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
			scopes: ["user-read-email"],
		}));
	}

	return new SpotifyClient({
		authProvider: accessToken!,
	});
};

export const Page = () => {
	const spotifyClient = useSpotifyClient();

	const { status, data: userProfile, error } = useQuery({
		queryKey: ["user-profile"],
		queryFn: () => {
			return getCurrentUserProfile(spotifyClient);
		},
		retry: false,
	});

	if (status === "error") {
		return <h1>{String(error)}</h1>;
	}

	if (status === "loading") {
		return <h1>Loading...</h1>;
	}

	return <h1>Welcome {userProfile.display_name}!</h1>;
};
