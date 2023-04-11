import { getCookie } from "cookies-next";
import { useCallback, useMemo } from "react";
import { getCurrentUser, SpotifyClient } from "@soundify/web-api";
import { ACCESS_TOKEN } from "../spotify";
import { useQuery } from "@tanstack/react-query";

export default function () {
  const authorize = useCallback(() => location.replace("/api/auth"), []);

  const client = useMemo(() => {
    const accessToken = getCookie(ACCESS_TOKEN);

    return new SpotifyClient({
      token: typeof accessToken === "string" ? accessToken : undefined,
      refresh: async () => {
        const res = await fetch("/api/refresh");
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const access_token = getCookie(ACCESS_TOKEN);
        if (typeof access_token !== "string") {
          throw new Error("Cannot refresh access token");
        }

        return access_token;
      },
    }, {
      onUnauthorized: authorize,
    });
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
