import { getCookie } from "cookies-next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useCallback, useEffect } from "react";
import { getCurrentUserProfile, type UserPrivate } from "soundify-web-api/web";
import { SPOTIFY_ACCESS_TOKEN } from "@/spotify/index.client";

type ServerSideData = {
	user?: UserPrivate;
};

export const getServerSideProps: GetServerSideProps<ServerSideData> = async ({
	req,
	res,
}) => {
	const accessToken = getCookie(SPOTIFY_ACCESS_TOKEN, { req, res });
	if (typeof accessToken !== "string") {
		return { props: {} };
	}

	try {
		const user = await getCurrentUserProfile(accessToken);
		return { props: { user } };
	} catch (error) {
		return { props: {} };
	}
};

export default function ({
	user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const loginToSpotify = useCallback(() => location.replace("/api/auth"), []);

	useEffect(() => {
		if (user || getCookie(SPOTIFY_ACCESS_TOKEN)) {
			return;
		}

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
			{user === undefined ? (
				<button onClick={loginToSpotify}>Login to spotify</button>
			) : (
				<h1>Welcome {user.display_name}!</h1>
			)}
		</>
	);
}
