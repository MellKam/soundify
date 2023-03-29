import { SpotifyClient } from "@soundify/api";
import { createContext, ReactNode, useContext } from "react";
import { ImplicitGrant } from "@soundify/web-auth/implicit-grant";

export const SpotifyContext = createContext<SpotifyClient | null>(null);

const authFlow = new ImplicitGrant({
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
	if (location.pathname === "/callback") {
		return <>{children}</>;
	}

	const accessToken = localStorage.getItem("SPOTIFY_ACCESS_TOKEN");
	if (accessToken) {
		const client = new SpotifyClient(accessToken);
		return (
			<SpotifyContext.Provider value={client}>
				{children}
			</SpotifyContext.Provider>
		);
	}

	const state = crypto.randomUUID();
	localStorage.setItem("state", state);

	location.replace(
		authFlow.getRedirectURL({
			scopes: ["user-read-email"],
			state,
		}),
	);

	return <h1>Redirecing to authorization...</h1>;
};

export const useSpotifyClinet = () => {
	const client = useContext(SpotifyContext);
	if (!client) {
		throw new Error("Unreachable");
	}
	return client;
};
