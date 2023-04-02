import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { PKCEAuthCode } from "@soundify/web-auth";
import { IAuthProvider, SpotifyClient } from "@soundify/api";

export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const SPOTIFY_ACCESS_TOKNE = "SPOTIFY_ACCESS_TOKEN";
export const CODE_VERIFIER = "CODE_VERIFIER";

const SpotifyContext = createContext<
	{ client: SpotifyClient<IAuthProvider> } | null
>(null);

const env = {
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
};

const authFlow = new PKCEAuthCode(env.client_id);

const authorize = async () => {
	const { code_challenge, code_verifier } = await PKCEAuthCode.generateCodes();
	localStorage.setItem(CODE_VERIFIER, code_verifier);

	location.replace(
		authFlow.getAuthURL({
			code_challenge,
			scopes: ["user-read-private", "user-top-read"],
			...env,
		}),
	);
};

export const SpotifyProvider = ({ children }: {
	children: ReactNode;
}) => {
	if (location.pathname === "/callback") {
		return <>{children}</>;
	}

	const client = useMemo(() => {
		const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);
		const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
		if (!refresh_token) return null;

		return new SpotifyClient(
			authFlow.createAuthProvider(refresh_token, {
				access_token: access_token ?? undefined,
				onRefreshSuccess: ({ access_token, refresh_token }) => {
					localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
					localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
				},
			}),
		);
	}, []);

	if (client === null) {
		authorize();
		return <h1>Redirecting...</h1>;
	}

	return (
		<SpotifyContext.Provider value={{ client }}>
			{children}
		</SpotifyContext.Provider>
	);
};

export const useSpotify = () => {
	const spotifyContext = useContext(SpotifyContext);
	if (spotifyContext === null) {
		throw new Error("Unreachable: SpotifyContext is null");
	}

	return spotifyContext;
};

export const handleCallback = (code: string, code_verifier: string) =>
	useQuery({
		queryKey: [],
		cacheTime: 0,
		queryFn: () => {
			return authFlow.getGrantData({
				code,
				code_verifier,
				redirect_uri: env.redirect_uri,
			});
		},
		onSuccess: ({ access_token, refresh_token }) => {
			localStorage.removeItem(CODE_VERIFIER);
			localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
			location.replace("/");
		},
		retry: false,
	});
