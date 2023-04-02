import { SpotifyClient } from "@soundify/api";
import { createContext, ReactNode, useContext } from "react";
import { ImplicitGrant } from "@soundify/web-auth";

export const SpotifyContext = createContext<SpotifyClient | null>(null);

const env = {
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
};

const authFlow = new ImplicitGrant(env.client_id);

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
	if (location.pathname === "/callback") {
		return <>{children}</>;
	}

	const accessToken = localStorage.getItem("SPOTIFY_ACCESS_TOKEN");
	if (!accessToken) {
		const state = crypto.randomUUID();
		localStorage.setItem("state", state);

		location.replace(
			authFlow.getAuthURL({
				scopes: ["user-read-email"],
				state,
				redirect_uri: env.redirect_uri,
			}),
		);
		return <h1>Redirecting</h1>;
	}

	const client = new SpotifyClient(accessToken);

	return (
		<SpotifyContext.Provider value={client}>
			{children}
		</SpotifyContext.Provider>
	);
};

export const useSpotifyClinet = () => {
	const client = useContext(SpotifyContext);
	if (!client) {
		throw new Error("Unreachable");
	}
	return client;
};
