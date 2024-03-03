import { createSpotifyError, SpotifyClient, SpotifyError } from "./client.ts";
import { sandbox } from "mock_fetch";
import {
	assert,
	assertEquals,
	assertInstanceOf,
	assertThrows,
} from "std/assert/mod.ts";

Deno.test("SpotifyClient: basic", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", (req) => {
		assert(req.url === "https://api.spotify.com/v1/me");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer TOKEN");
		return Response.json({ id: "123" });
	});

	const client = new SpotifyClient("TOKEN", { fetch });
	const res = await client.fetch("/v1/me");
	assert(res.status === 200);
	assertEquals(await res.json(), { id: "123" });
});

Deno.test("SpotifyClient: error handling", async () => {
	const { mock, fetch } = sandbox();
	const playlistId = crypto.randomUUID();

	mock("PUT@/v1/playlists/:playlistId/followers", () => {
		return Response.json(
			{ error: { status: 400, message: "Invalid request" } },
			{ status: 400, statusText: "Bad Request" },
		);
	});

	const client = new SpotifyClient("TOKEN", { fetch });

	try {
		await client.fetch(`/v1/playlists/${playlistId}/followers`, {
			method: "PUT",
		});
		assert(false, "should throw an error");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.message === "400 Bad Request : Invalid request");
		assertEquals(error.body, {
			error: { status: 400, message: "Invalid request" },
		});
	}
});

Deno.test("createSpotifyError: regular error object", async () => {
	const response = new Response(
		JSON.stringify({ error: { status: 400, message: "Invalid request" } }),
		{
			status: 400,
			statusText: "Bad Request",
			headers: { "Content-Type": "application/json" },
		},
	);

	const error = await createSpotifyError(response);
	assertInstanceOf(error, SpotifyError);
	assert(error.message === "400 Bad Request : Invalid request");
	assertEquals(error.body, {
		error: { status: 400, message: "Invalid request" },
	});
});

Deno.test("createSpotifyError: response with URL query", async () => {
	const response = new Response("Please, provide access token", {
		status: 401,
		statusText: "Unauthorized",
	});

	Object.defineProperty(
		response,
		"url",
		{ get: () => "https://api.spotify.com/v1/me" },
	);

	const error = await createSpotifyError(response);
	assertInstanceOf(error, SpotifyError);
	assert(
		error.message ===
			"401 Unauthorized (https://api.spotify.com/v1/me) : Please, provide access token",
	);
	assertEquals(error.body, "Please, provide access token");
});

Deno.test("SpotifyClient: fetch - basic", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", (req) => {
		assert(req.url === "https://api.spotify.com/v1/me");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer TOKEN");
		return Response.json({ id: "123" });
	});

	const client = new SpotifyClient("TOKEN", { fetch });
	const res = await client.fetch("/v1/me");
	assert(res.status === 200);
	assertEquals(await res.json(), { id: "123" });
});

Deno.test("SpotifyClient: fetch - with query parameters", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/search", (req) => {
		assert(req.url === "https://api.spotify.com/v1/search?q=test&type=track");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer TOKEN");
		return Response.json({ results: [] });
	});

	const client = new SpotifyClient("TOKEN", { fetch });
	const res = await client.fetch("/v1/search", {
		query: { q: "test", type: "track" },
	});
	assert(res.status === 200);
	assertEquals(await res.json(), { results: [] });
});

Deno.test("SpotifyClient: fetch - with JSON body", async () => {
	const { mock, fetch } = sandbox();

	mock("POST@/v1/playlists", async (req) => {
		assert(req.url === "https://api.spotify.com/v1/playlists");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer TOKEN");
		assert(req.headers.get("Content-Type") === "application/json");
		assertEquals(await req.json(), { name: "My Playlist" });
		return Response.json({ id: "playlist123" });
	});

	const client = new SpotifyClient("TOKEN", { fetch });
	const res = await client.fetch("/v1/playlists", {
		method: "POST",
		body: { name: "My Playlist" },
	});
	assert(res.status === 200);
	assertEquals(await res.json(), { id: "playlist123" });
});

Deno.test("SpotifyClient: fetch - with access token refresher", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", (req) => {
		assert(req.url === "https://api.spotify.com/v1/me");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer NEW_TOKEN");
		return Response.json({ id: "123" });
	});

	const client = new SpotifyClient(null, {
		fetch,
		refresher: () => Promise.resolve("NEW_TOKEN"),
	});

	const res = await client.fetch("/v1/me");
	assert(res.status === 200);
	assertEquals(await res.json(), { id: "123" });
});

Deno.test("SpotifyClient: fetch - rate limit handling", async () => {
	const { mock, fetch } = sandbox();

	let isRateLimited = false;

	mock("GET@/v1/search", () => {
		if (isRateLimited) {
			return Response.json({ results: [] });
		}
		isRateLimited = true;
		return new Response(null, {
			status: 429,
			headers: { "Retry-After": "3" },
		});
	});

	const client = new SpotifyClient("TOKEN", {
		fetch,
		waitForRateLimit: (retryAfter) => {
			assert(retryAfter === 3);
			return true;
		},
	});

	const start = Date.now();
	const res2 = await client.fetch("/v1/search", {
		query: { q: "test", type: "track" },
	});
	const end = Date.now();
	assert(res2.status === 200);
	assertEquals(await res2.json(), { results: [] });
	assert(end - start >= 3000);
});

Deno.test("SpotifyClient: fetch - error handling", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", () => {
		return new Response(null, {
			status: 500,
			statusText: "Internal Server Error",
		});
	});

	const client = new SpotifyClient("TOKEN", { fetch });

	try {
		await client.fetch("/v1/me");
		assert(false, "should throw an error");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.message === "500 Internal Server Error");
		assertEquals(error.body, "");
	}
});

Deno.test("SpotifyClient: constructor - without access token and refresher", () => {
	// @ts-expect-error - testing invalid input
	assertThrows(() => new SpotifyClient(null));
	assertThrows(() => new SpotifyClient(""));
});

Deno.test("SpotifyClient: multiple refreshes at the same time", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", (req) => {
		assert(req.headers.get("Authorization") === "Bearer NEW_TOKEN_1");
		return Response.json({ id: "123" });
	});

	let refresherCalls = 0;

	const client = new SpotifyClient(null, {
		fetch,
		refresher: async () => {
			await new Promise((res) => setTimeout(res, 500));
			refresherCalls++;
			return Promise.resolve("NEW_TOKEN_" + refresherCalls);
		},
	});

	await Promise.all([
		client.fetch("/v1/me"),
		client.fetch("/v1/me"),
		client.fetch("/v1/me"),
	]);
});
