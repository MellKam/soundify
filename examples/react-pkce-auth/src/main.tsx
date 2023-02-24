import React from "react";
import { createRoot } from "react-dom/client";
import { Page as IndexPage } from "./pages/index";
import { Page as CallbackPage } from "./pages/callback";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpotifyConfig, SpotifyProvider } from "./spotify";

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		path: "/",
		element: <IndexPage />,
	},
	{
		path: "/callback",
		element: <CallbackPage />,
	},
]);

const config: SpotifyConfig = {
	client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
	redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
	scopes: ["user-read-private", "user-top-read"],
};

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<SpotifyProvider
				config={config}
			>
				<RouterProvider router={router} />
			</SpotifyProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
