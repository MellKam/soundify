import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "soundify-web-api/web";
import { authorize, useSpotifyClient } from "../spotify";

export const Page = () => {
	const spotifyClient = useSpotifyClient();
	if (spotifyClient === null) {
		authorize();
		return <h1>Redirecting to Spotify...</h1>;
	}

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
