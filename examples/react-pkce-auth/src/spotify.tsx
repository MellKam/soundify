import { useQuery } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { PKCEAuthCode, SpotifyClient } from "@soundify/web-api";

const appName = "react-pkce-auth";

export const SPOTIFY_REFRESH_TOKEN = appName + "-refresh-token";
export const SPOTIFY_ACCESS_TOKNE = appName + "-access-token";
export const CODE_VERIFIER = appName + "-code-verifier";

const SpotifyContext = createContext<SpotifyClient | null>(null);

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
      redirect_uri: env.redirect_uri,
    }),
  );
};

export const SpotifyProvider = ({ children }: {
  children: ReactNode;
}) => {
  const client = useMemo(() => {
    const access_token = localStorage.getItem(SPOTIFY_ACCESS_TOKNE);
    const refresh_token = localStorage.getItem(SPOTIFY_REFRESH_TOKEN);
    if (!refresh_token) return null;

    return new SpotifyClient(
      authFlow.createAuthProvider(refresh_token, {
        token: access_token ?? undefined,
        onRefreshSuccess: ({ access_token, refresh_token }) => {
          localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
          localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
        },
      }),
      { onUnauthorized: authorize },
    );
  }, []);

  if (location.pathname === "/callback") {
    return <>{children}</>;
  }

  if (client === null) {
    authorize();
    return <h1>Redirecting...</h1>;
  }

  return (
    <SpotifyContext.Provider value={client}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotifyClient = () => {
  const spotifyContext = useContext(SpotifyContext);
  if (spotifyContext === null) {
    throw new Error("Unreachable: SpotifyContext is null");
  }

  return spotifyContext;
};

export const useHandleCallback = () => {
  return useQuery({
    queryKey: ["spotify-callback"],
    queryFn: async () => {
      const data = PKCEAuthCode.parseCallbackData(
        new URLSearchParams(location.search),
      );
      if ("error" in data) {
        throw new Error(data.error);
      }

      const code_verifier = localStorage.getItem(CODE_VERIFIER);
      if (!code_verifier) {
        throw new Error("Cannot find code_verifier");
      }

      return await authFlow.getGrantData({
        code: data.code,
        code_verifier,
        redirect_uri: env.redirect_uri,
      });
    },
    staleTime: Infinity,
    onSuccess: ({ access_token, refresh_token }) => {
      localStorage.removeItem(CODE_VERIFIER);
      localStorage.setItem(SPOTIFY_REFRESH_TOKEN, refresh_token);
      localStorage.setItem(SPOTIFY_ACCESS_TOKNE, access_token);
    },
    retry: false,
  });
};
