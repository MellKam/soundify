import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@soundify/web-api";
import { useSpotifyClinet } from "../spotify";

export const Page = () => {
  const client = useSpotifyClinet();

  const {
    status,
    data: userProfile,
    error,
  } = useQuery({
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

  return <h1>Welcome {userProfile.display_name}!</h1>;
};
