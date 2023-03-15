import { SpotifyClient, SpotifyError } from "api/client.ts";
import { UserPrivate } from "api/user/user.types.ts";
import * as mockFetch from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
	assert,
	assertInstanceOf,
	assertObjectMatch,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { privateUserStub } from "api/user/user.stubs.ts";
import {
	assertSpyCall,
	assertSpyCalls,
	stub,
} from "https://deno.land/std@0.178.0/testing/mock.ts";
import { AuthCode } from "auth/mod.ts";

mockFetch.install();

Deno.test("SpotifyClient with access token and simple get request", async () => {
	const accessTokenMock = crypto.randomUUID();

	mockFetch.mock("GET@/v1/me", (req) => {
		const authHeader = req.headers.get("Authorization");
		if (!authHeader) {
			throw new Error("Cannot find Authorization header");
		}

		const accessToken = authHeader.split(" ")[1];
		if (accessToken !== accessTokenMock) {
			throw new Error(
				`Access token not equal to mock token. Got "${accessToken}". Must be "${accessTokenMock}"`,
			);
		}

		return new Response(JSON.stringify(privateUserStub), {
			status: 200,
		});
	});

	const client = new SpotifyClient(accessTokenMock);

	const user = await client.fetch<UserPrivate>("/me", "json");

	// deno-lint-ignore no-explicit-any
	assertObjectMatch(user, privateUserStub as any);

	mockFetch.reset();
});

Deno.test("SpotifyClient with access token and put request with body", async () => {
	const playlistID = crypto.randomUUID();

	mockFetch.mock(
		`PUT@/v1/playlists/:playlist_id/followers`,
		async (req, match) => {
			assert(match["playlist_id"] === playlistID);

			// deno-lint-ignore no-explicit-any
			const data = await req.json() as Record<PropertyKey, any>;
			assertObjectMatch(data, { public: true });

			return new Response("", {
				status: 200,
			});
		},
	);

	const client = new SpotifyClient("");

	const result = await client.fetch(
		`/playlists/${playlistID}/followers`,
		"void",
		{
			method: "PUT",
			body: { public: true },
		},
	);

	assert(result === undefined);

	mockFetch.reset();
});

Deno.test("SpotifyClient with query params", async () => {
	mockFetch.mock(
		`DELETE@/v1/me`,
		(req) => {
			const url = new URL(req.url);
			assert(url.search === "?c=5");

			return new Response();
		},
	);

	const client = new SpotifyClient("");

	await client.fetch(
		"/me",
		"void",
		{
			method: "DELETE",
			query: {
				c: 5,
			},
		},
	);

	mockFetch.reset();
});

Deno.test("SpotifyClient and bad request error", async () => {
	mockFetch.mock("GET@/v1/me", (_) => {
		return new Response(
			JSON.stringify({ error: { message: "Oops", status: 400 } }),
			{
				status: 400,
			},
		);
	});

	const client = new SpotifyClient("");

	try {
		await client.fetch<UserPrivate>("/me", "json");

		assert(false, "client.fetch should throw an error");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.message === "Oops");
		assert(error.status === 400);
	}

	mockFetch.reset();
});

Deno.test("SpotifyClient with AuthProvider", async () => {
	// Throws a 401 if no token is set, returns 200 and data otherwise
	mockFetch.mock("GET@/v1/me", (req) => {
		const authHeader = req.headers.get("Authorization");
		if (authHeader === null) {
			throw new Error("Cannot find Authorization header");
		}

		const accessToken = authHeader.split(" ")[1];
		if (!accessToken) {
			return new Response(
				JSON.stringify({ error: { message: "Not authorized", status: 401 } }),
				{
					status: 401,
				},
			);
		}

		return new Response(
			JSON.stringify(privateUserStub),
			{
				status: 200,
			},
		);
	});

	const authProvider = new AuthCode.AccessProvider({
		client_id: "",
		client_secret: "",
		refresh_token: "",
	});

	const expectedToken = crypto.randomUUID();

	const getAccessTokenStub = stub(
		authProvider,
		"getAccessToken",
		// deno-lint-ignore require-await
		async (forceRefresh) => {
			if (forceRefresh) return expectedToken;
			return "";
		},
	);

	const client = new SpotifyClient(authProvider);

	await client.fetch<UserPrivate>("/me", "json");

	// first time -> when the first request is made
	assertSpyCall(getAccessTokenStub, 0);
	// secodn time -> on receiving a 401 and trying to update
	assertSpyCall(getAccessTokenStub, 1, {
		args: [true],
	});

	// should not try to update the token more than once
	assertSpyCalls(getAccessTokenStub, 2);

	getAccessTokenStub.restore();
	mockFetch.reset();
});

Deno.test("SpotifyClient with AuthProvider and double 401 error", async () => {
	// will always throw and 401 error
	mockFetch.mock("GET@/v1/me", () => {
		return new Response(
			JSON.stringify({ error: { message: "Not authorized", status: 401 } }),
			{
				status: 401,
			},
		);
	});

	const authProvider = new AuthCode.AccessProvider({
		client_id: "",
		client_secret: "",
		refresh_token: "",
	});

	const getAccessTokenStub = stub(authProvider, "getAccessToken");
	const client = new SpotifyClient(authProvider);

	try {
		// it must throw an error
		await client.fetch<UserPrivate>("/me", "json");

		assert(false, "client.fetch should throw an error");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.status === 401);
		assert(error.message === "Not authorized");
	}

	// first time -> when the first request is made
	assertSpyCall(getAccessTokenStub, 0);
	// secodn time -> on receiving a 401 and trying to update
	assertSpyCall(getAccessTokenStub, 1, {
		args: [true],
	});

	// should not try to update the token more than once
	assertSpyCalls(getAccessTokenStub, 2);

	getAccessTokenStub.restore();
	mockFetch.reset();
});

Deno.test("SpotifyClient with retry on 429", async () => {
	let requestID = 0;

	mockFetch.mock("GET@/v1/me", () => {
		requestID++;
		if (requestID === 2) return new Response();

		return new Response(
			JSON.stringify({ error: { message: "Rate limit hit", status: 429 } }),
			{
				headers: {
					"Retry-After": "1", // retry after 1 second
				},
				status: 429,
			},
		);
	});

	const client = new SpotifyClient("", {
		retryOnRateLimit: true,
	});

	await client.fetch("/me", "void");

	assert(requestID === 2);

	mockFetch.reset();
});

Deno.test("SpotifyClient with retries on 5xx", async () => {
	let requestID = 0;
	const expectedRequestsCount = 4;

	// will always throw and 500 error
	mockFetch.mock("GET@/v1/me", () => {
		requestID++;
		console.log(`Request ${requestID}`);
		if (requestID === expectedRequestsCount) {
			return new Response();
		}

		return new Response(
			JSON.stringify({ error: { message: "Server error", status: 500 } }),
			{
				status: 500,
			},
		);
	});

	const authProvider = new AuthCode.AccessProvider({
		client_id: "",
		client_secret: "",
		refresh_token: "",
		access_token: "",
	});

	const client = new SpotifyClient(authProvider, {
		retryDelayOn5xx: 500,
		retryTimesOn5xx: expectedRequestsCount - 1,
	});

	await client.fetch("/me", "void");

	// first request + 3 retries = 4 requests
	assert(requestID === expectedRequestsCount);

	mockFetch.reset();
});

Deno.test("SpotifyClient tests for setAuthProvider method", async () => {
	mockFetch.mock("GET@/v1/me", (req) => {
		const accessToken = req.headers.get("authorization")?.split(" ").at(1);
		if (!accessToken) {
			throw new Error("Can't get access token from headers");
		}

		if (accessToken === "1") {
			return new Response(
				JSON.stringify({ error: { status: 401, error: "Error" } }),
				{ status: 401 },
			);
		}
		if (accessToken === "2") {
			return new Response(null);
		}

		return new Response(
			JSON.stringify({ error: { status: 500, error: "Error" } }),
			{ status: 500 },
		);
	});

	const client = new SpotifyClient("1");

	try {
		await client.fetch("/me", "void");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.status === 401);

		client.setAccessProvider("2");
		await client.fetch("/me", "void");
	}

	mockFetch.reset();
});
