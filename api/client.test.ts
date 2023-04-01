import { SpotifyClient, SpotifyError } from "api/client.ts";
import { UserPrivate } from "api/user/user.types.ts";
import * as mockFetch from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
	assert,
	assertEquals,
	assertInstanceOf,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { privateUserStub } from "api/user/user.stubs.ts";
import {
	assertSpyCall,
	assertSpyCalls,
	spy,
} from "https://deno.land/std@0.182.0/testing/mock.ts";
import { JSONObject } from "./mod.ts";
import { IAuthProvider, toQueryString } from "../shared/mod.ts";

mockFetch.install();

Deno.test("SpotifyClient: raw string token as auth provider and simple GET request", async () => {
	const accessToken = crypto.randomUUID();

	mockFetch.mock("GET@/v1/me", (req) => {
		const token = req.headers.get("Authorization")?.split(" ").at(1);
		if (!token) {
			throw new Error("Invalid 'Authorization' header");
		}

		if (token !== accessToken) {
			throw new Error(
				`Access token not equal to mock token. Got "${token}". Must be "${accessToken}"`,
			);
		}

		return new Response(JSON.stringify(privateUserStub));
	});

	const client = new SpotifyClient(accessToken);
	const user = await client.fetch<UserPrivate>("/me", "json");

	assertEquals(
		user,
		privateUserStub,
		"Received user object not equals expected object",
	);

	mockFetch.reset();
});

Deno.test("SpotifyClient: PUT request with json body", async () => {
	const playlistID = crypto.randomUUID();

	mockFetch.mock(
		"PUT@/v1/playlists/:playlist_id/followers",
		async (req, match) => {
			assert(match["playlist_id"] === playlistID);

			const data = await req.json() as JSONObject;
			assertEquals(data, { public: true });

			return new Response(null);
		},
	);

	const client = new SpotifyClient("TOKEN");

	const result = await client.fetch(
		`/playlists/${playlistID}/followers`,
		"void",
		{
			method: "PUT",
			json: { public: true },
		},
	);

	assert(result === undefined);

	mockFetch.reset();
});

Deno.test("SpotifyClient: Search params", async () => {
	const objParams = { a: "2", b: true, c: 5 };
	const stringParams = toQueryString(objParams);

	mockFetch.mock(
		`GET@/v1/me`,
		(req) => {
			assert(new URL(req.url).search === ("?" + stringParams));

			return new Response();
		},
	);

	const client = new SpotifyClient("TOKEN");

	await client.fetch(
		"/me",
		"void",
		{ query: objParams },
	);

	mockFetch.reset();
});

Deno.test("SpotifyClient: Bad request error (400)", async () => {
	mockFetch.mock("GET@/v1/me", () => {
		return new Response(
			JSON.stringify({ error: { message: "Oops", status: 400 } }),
			{
				status: 400,
			},
		);
	});

	const client = new SpotifyClient("TOKEN");

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

Deno.test("SpotifyClient: AuthProvider", async () => {
	const STALE_TOKEN = crypto.randomUUID();
	const VALID_TOKEN = crypto.randomUUID();

	mockFetch.mock("GET@/v1/me", (req) => {
		const token = req.headers.get("Authorization")?.split(" ").at(1);
		if (!token) {
			throw new Error("Invalid 'Authorization' header");
		}

		if (token !== VALID_TOKEN) {
			return new Response(
				JSON.stringify({ error: { message: "Not authorized", status: 401 } }),
				{
					status: 401,
				},
			);
		}

		return new Response(JSON.stringify(privateUserStub));
	});

	class MockProvider implements IAuthProvider {
		constructor(public access_token: string) {}

		getToken(): string {
			return this.access_token;
		}

		refreshToken(): Promise<string> {
			return new Promise((resolve) => {
				this.access_token = VALID_TOKEN;
				resolve(this.access_token);
			});
		}
	}

	const authProvider = new MockProvider(STALE_TOKEN);

	const getAccessTokenSpyier = spy(authProvider, "getToken");
	const refreshTokenSpyier = spy(authProvider, "refreshToken");

	const client = new SpotifyClient(authProvider);
	await client.fetch<UserPrivate>("/me", "json");

	// when the first request is made
	assertSpyCall(getAccessTokenSpyier, 0);
	// on receiving a 401 and trying to refresh
	assertSpyCall(refreshTokenSpyier, 0);

	// should not try to get and update the token more than once
	assertSpyCalls(getAccessTokenSpyier, 1);
	assertSpyCalls(refreshTokenSpyier, 1);

	getAccessTokenSpyier.restore();
	refreshTokenSpyier.restore();
	mockFetch.reset();
});

Deno.test("SpotifyClient: AuthProvider and double 401 error", async () => {
	mockFetch.mock("GET@/v1/me", () => {
		return new Response(
			JSON.stringify({ error: { message: "Not authorized", status: 401 } }),
			{
				status: 401,
			},
		);
	});

	class MockProvider implements IAuthProvider {
		constructor(public access_token: string) {}

		getToken(): string {
			return this.access_token;
		}

		refreshToken(): Promise<string> {
			return new Promise((resolve) => {
				resolve(this.access_token);
			});
		}
	}

	const authProvider = new MockProvider("TOKEN");

	const getAccessTokenSpyier = spy(authProvider, "getToken");
	const refreshTokenSpyier = spy(authProvider, "refreshToken");

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

	// when the first request is made
	assertSpyCall(getAccessTokenSpyier, 0);
	// on receiving a 401 and trying to refresh
	assertSpyCall(refreshTokenSpyier, 0);

	// should not try to get and update the token more than once
	assertSpyCalls(getAccessTokenSpyier, 1);
	assertSpyCalls(refreshTokenSpyier, 1);

	getAccessTokenSpyier.restore();
	refreshTokenSpyier.restore();
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

	const client = new SpotifyClient("TOKEN", {
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

	class MockProvider implements IAuthProvider {
		constructor(public access_token: string) {}

		getToken(): string {
			return this.access_token;
		}

		refreshToken(): Promise<string> {
			return new Promise((resolve) => {
				resolve(this.access_token);
			});
		}
	}

	const client = new SpotifyClient(new MockProvider("TOKEN"), {
		retryDelayOn5xx: 200,
		retryTimesOn5xx: expectedRequestsCount - 1,
	});

	await client.fetch("/me", "void");

	// first request + 3 retries = 4 requests
	assert(requestID === expectedRequestsCount);

	mockFetch.reset();
});

Deno.test("SpotifyClient: setAuthProvider method", () => {
	const FIRST_TOKEN = crypto.randomUUID();
	const SECOND_TOKEN = crypto.randomUUID();
	const PROVIDER = {} as IAuthProvider;

	const client = new SpotifyClient(FIRST_TOKEN);
	assert(client["authProvider"] === FIRST_TOKEN);

	client.setAuthProvider(SECOND_TOKEN);
	assert(client["authProvider"] === SECOND_TOKEN);

	client.setAuthProvider(PROVIDER);
	assertEquals<IAuthProvider>(
		client["authProvider"] as unknown as IAuthProvider,
		PROVIDER,
	);
});
