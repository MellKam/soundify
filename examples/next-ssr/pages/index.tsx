import { getCookie } from "cookies-next";
import { useCallback, useMemo } from "react";
import { getCurrentUser, SpotifyClient, type UserPrivate } from "@soundify/api";
import { ACCESS_TOKEN } from "../spotify";
import { useQuery } from "@tanstack/react-query";

export default function () {
	const loginToSpotify = useCallback(() => location.replace("/api/auth"), []);

	const accessToken = getCookie(ACCESS_TOKEN);

	const client = useMemo(() => {
		return new SpotifyClient(
			typeof accessToken === "string" ? accessToken : "x",
			{
				onUnauthorized: async () => {
					const res = await fetch("/api/refresh");
					if (!res.ok) loginToSpotify();

					const accessToken = getCookie(ACCESS_TOKEN);
					if (typeof accessToken !== "string") {
						throw new Error("Cannot refresh access token");
					}

					return accessToken;
				},
			},
		);
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
