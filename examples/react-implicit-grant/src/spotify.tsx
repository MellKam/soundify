import { ImplicitFlow, SpotifyClient } from "@soundify/web-api";
import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

export const SpotifyContext = createContext<SpotifyClient | null>(null);

const env = {
  client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI
};

const authFlow = new ImplicitFlow(env.client_id);

const authorize = () => {
  const state = crypto.randomUUID();
  localStorage.setItem("state", state);

  location.replace(
    authFlow.getAuthURL({
      scopes: ["user-read-email"],
      state,
      redirect_uri: env.redirect_uri
    })
  );
};

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  if (location.pathname === "/callback") {
    return <>{children}</>;
  }

  const accessToken = localStorage.getItem("SPOTIFY_ACCESS_TOKEN");
  if (!accessToken) {
    authorize();
    return <h1>Redirecting...</h1>;
  }

  const client = new SpotifyClient(accessToken, { onUnauthorized: authorize });

  return (
    <SpotifyContext.Provider value={client}>{children}</SpotifyContext.Provider>
  );
};

export const useSpotifyClinet = () => {
  const client = useContext(SpotifyContext);
  if (!client) {
    throw new Error("Unreachable");
  }
  return client;
};

export const useHandleCallback = () => {
  return useQuery({
    staleTime: Infinity,
    retry: false,
    queryFn: () => {
      const params = ImplicitFlow.parseCallbackData(location.hash);
      if ("error" in params) {
        throw new Error(params.error);
      }

      const storedState = localStorage.getItem("state");
      if (!storedState || !params.state || storedState !== params.state) {
        throw new Error("Invalid state");
      }

      localStorage.removeItem("state");
      localStorage.setItem("SPOTIFY_ACCESS_TOKEN", params.access_token);
      return true;
    }
  });
};
