import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { AuthScope, PKCEAuthCode, SpotifyClient } from "soundify-web-api/web";

export const SPOTIFY_REFRESH_TOKEN = "SPOTIFY_REFRESH_TOKEN";
export const SPOTIFY_ACCESS_TOKNE = "SPOTIFY_ACCESS_TOKEN";
export const CODE_VERIFIER = "CODE_VERIFIER";

export const config = {
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
};

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

const authorize = async (config: SpotifyConfig) => {
	const { code_challenge, code_verifier } = await PKCEAuthCode.generateCodes();
	localStorage.setItem(CODE_VERIFIER, code_verifier);

	location.replace(PKCEAuthCode.getAuthURL({
		code_challenge,
		...config,
	}));
};

export const SpotifyProvider = (
	{ children, config }: {
		children: ReactNode;
		config: SpotifyConfig;
	},
) => {
	const callbackPathname = useMemo(
		() => new URL(config.redirect_uri).pathname,
		[
			config.redirect_uri,
		],
	);
	if (location.pathname === callbackPathname) {
		return <>{children}</>;
	}

	const client = useMemo(() => {
		const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);
		const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
		if (!refresh_token) {
			return null;
		}

		const authProvider = new PKCEAuthCode.AuthProvider({
			client_id: config.client_id,
			refresh_token: refresh_token!,
			access_token: access_token ? access_token : undefined,
			saveAccessToken: (access_token) => {
				localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
			},
			saveRefreshToken: (refresh_token) => {
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
			return PKCEAuthCode.getGrantData(
				{
					code: code!,
					code_verifier: code_verifier!,
					client_id: config.client_id,
					redirect_uri: config.redirect_uri,
				},
			);
		},
		onSuccess: ({ access_token, refresh_token }) => {
			localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
			localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
			location.replace("/");
		},
		retry: false,
	});
