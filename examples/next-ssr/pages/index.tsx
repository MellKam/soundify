import { getCookie } from "cookies-next";
import { useCallback, useMemo } from "react";
import { AuthProvider, getCurrentUser, SpotifyClient } from "@soundify/api";
import { ACCESS_TOKEN } from "../spotify";
import { useQuery } from "@tanstack/react-query";

export default function () {
	const loginToSpotify = useCallback(() => location.replace("/api/auth"), []);

	const client = useMemo(() => {
		const accessToken = getCookie(ACCESS_TOKEN);

		const authProvider = new AuthProvider(
			{
				access_token: typeof accessToken === "string" ? accessToken : undefined,
				refresher: async () => {
					const res = await fetch("/api/refresh");
					if (!res.ok) loginToSpotify();

					const access_token = getCookie(ACCESS_TOKEN);
					if (typeof access_token !== "string") {
						throw new Error("Cannot refresh access token");
					}

					return { access_token };
				},
			},
		);

		return new SpotifyClient(authProvider);
	}, []);

	const { data: user, status, error } = useQuery({
		queryKey: ["user-profile"],
		queryFn: () => getCurrentUser(client),
		retry: false,
	});

	if (status === "error") {
		return <h1>{String(error)}</h1>;
	}

	if (status === "loading") {
		return <h1>Loading...</h1>;
	}

	return <h1>Welcome {user.display_name}!</h1>;
}
