import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { AuthScope, PKCEAuthCode } from "@soundify/web-auth";
import { AuthProvider } from "@soundify/web-auth/pkce-auth-code";
import { SpotifyClient } from "@soundify/api";

export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const SPOTIFY_ACCESS_TOKNE = "SPOTIFY_ACCESS_TOKEN";
export const CODE_VERIFIER = "CODE_VERIFIER";

const SpotifyContext = createContext<
	{
		client: SpotifyClient;
	} | null
>(null);

export type SpotifyConfig = {
	client_id: string;
	redirect_uri: string;
	scopes: AuthScope[];
};

const authFlow = new PKCEAuthCode({
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
});

const authorize = async (config: SpotifyConfig) => {
	const { code_challenge, code_verifier } = await PKCEAuthCode.generateCodes();
	localStorage.setItem(CODE_VERIFIER, code_verifier);

	location.replace(
		authFlow.getRedirectURL({
			code_challenge,
			...config,
		}),
	);
};

export const SpotifyProvider = ({
	children,
	config,
}: {
	children: ReactNode;
	config: SpotifyConfig;
}) => {
	const callbackPathname = useMemo(
		() => new URL(config.redirect_uri).pathname,
		[config.redirect_uri],
	);
	if (location.pathname === callbackPathname) {
		return <>{children}</>;
	}

	const client = useMemo(() => {
		const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);
		const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
		if (!refresh_token) return null;

		const authProvider = new AuthProvider(authFlow, refresh_token, {
			access_token: access_token ?? "",
			onRefresh: ({ access_token, refresh_token }) => {
				localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
				localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			},
		});

		return new SpotifyClient(authProvider);
	}, []);

	if (client === null) {
		authorize(config);
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

export const getCallbackData = () => {
	const code = new URLSearchParams(location.search).get("code");
	const code_verifier = localStorage.getItem(CODE_VERIFIER);

	return { code, code_verifier };
};

export const handleCallback = (code: string, code_verifier: string) =>
	useQuery({
		queryKey: [],
		cacheTime: 0,
		queryFn: () => {
			return authFlow.getGrantData({
				code: code!,
				code_verifier: code_verifier!,
			});
		},
		onSuccess: ({ access_token, refresh_token }) => {
			localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
			location.replace("/");
		},
		retry: false,
	});
