import { ImplicitGrant } from "@soundify/web-auth";

export const Page = () => {
	try {
		const params = ImplicitGrant.parseCallbackData(location.hash);
		if ("error" in params) {
			throw new Error(params.error);
		}

		const storedState = localStorage.getItem("state");
		if (!storedState || !params.state || storedState !== params.state) {
			console.log(storedState, params.state);
			throw new Error("Invalid state");
		}

		localStorage.removeItem("state");
		localStorage.setItem("SPOTIFY_ACCESS_TOKEN", params.access_token);

		location.replace("/");
		return <h1>Redirecting...</h1>;
	} catch (error) {
		return <h1>{String(error)}</h1>;
	}
};
