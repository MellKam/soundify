import { getCookie } from "cookies-next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useEffect } from "react";
import { getCurrentUser, SpotifyClient, type UserPrivate } from "@soundify/api";
import { ACCESS_TOKEN } from "../consts";

const client = new SpotifyClient("PLACEHOLDER");

export const getServerSideProps: GetServerSideProps<{
  user?: UserPrivate;
}> = async ({ req, res }) => {
  const accessToken = getCookie(ACCESS_TOKEN, { req, res });
  if (typeof accessToken !== "string") {
    return { props: {} };
  }
  client.setAuthProvider(accessToken);

  try {
    const user = await getCurrentUser(client);
    return { props: { user } };
  } catch (error) {
    console.log(error);
    return { props: {} };
  }
};

export default function ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const loginToSpotify = useCallback(() => location.replace("/api/auth"), []);

  useEffect(() => {
    if (user) return;
    if (typeof getCookie(ACCESS_TOKEN) === "string") return;

    (async () => {
      try {
        const res = await fetch("/api/refresh");
        if (!res.ok) {
          throw new Error(await res.text());
        }

        location.reload();
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <>
      {user ? (
        <h1>Welcome {user.display_name}!</h1>
      ) : (
        <button onClick={loginToSpotify}>Login to spotify</button>
      )}
    </>
  );
}
