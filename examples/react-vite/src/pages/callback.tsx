import { ImplicitGrant } from "soundify-web-api/web";
import { SPOTIFY_ACCESS_TOKEN } from "../spotify";

export const Page = () => {
	const { access_token } = ImplicitGrant.getGrantData(location.hash);
	localStorage.setItem(SPOTIFY_ACCESS_TOKEN, access_token);

	location.replace("/");
	return <h1>Redirecting...</h1>;
};
