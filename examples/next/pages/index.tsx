import { getCookie } from "cookies-next";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getCurrentUserProfile, type UserPrivate } from "soundify-web-api";

type ServerSideData = {
	user?: UserPrivate;
};

export const getServerSideProps: GetServerSideProps<ServerSideData> = async (
	{ req, res },
) => {
	const accessToken = getCookie("SPOTIFY_ACCESS_TOKEN", { req, res });
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

export default function Home(
	{ user }: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
	const loginToSpotify = () => location.replace("/api/auth");

	return (
		<>
			{user === undefined
				? <button onClick={loginToSpotify}>Login to spotify</button>
				: <h1>Welcome {user.display_name}!</h1>}
		</>
	);
}
