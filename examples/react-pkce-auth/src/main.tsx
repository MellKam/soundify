import React from "react";
import { createRoot } from "react-dom/client";
import { Page as IndexPage } from "./pages/index";
import { Page as CallbackPage } from "./pages/callback";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpotifyProvider } from "./spotify";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<SpotifyProvider>
					<Routes>
						<Route path="/" element={<IndexPage />} />
						<Route path="/callback" element={<CallbackPage />} />
					</Routes>
				</SpotifyProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>,
);
