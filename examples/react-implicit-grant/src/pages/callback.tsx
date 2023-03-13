import { ImplicitGrant } from "@soundify/web-auth";

export const Page = () => {
	const { access_token } = ImplicitGrant.getGrantData(location.hash);
	localStorage.setItem("SPOTIFY_ACCESS_TOKEN", access_token);

	location.replace("/");
	return <h1>Redirecting...</h1>;
};
