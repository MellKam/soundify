import React from "react";
import { createRoot } from "react-dom/client";
import { Page as IndexPage } from "./pages/index";
import { Page as CallbackPage } from "./pages/callback";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
);
