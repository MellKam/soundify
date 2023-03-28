import {
	assert,
	assertEquals,
	assertRejects,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { describe } from "https://deno.land/std@0.181.0/testing/bdd.ts";
import {
	AuthProvider,
	AuthProviderConfig,
	getGrantData,
	GetGrantDataOpts,
	getRedirectURL,
	refresh,
} from "auth/auth_code.ts";
import {
	ApiTokenReqParams,
	AuthScope,
	getBasicAuthHeader,
	KeypairResponse,
	ScopedAccessResponse,
	SpotifyAuthError,
} from "auth/general.ts";
import * as mockFetch from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
	assertSpyCall,
	assertSpyCalls,
	spy,
	stub,
} from "https://deno.land/std@0.181.0/testing/mock.ts";

Deno.test("AuthCode: getRedirectURL", () => {
	const expectedURL =
		"https://accounts.spotify.com/authorize?response_type=code&client_id=321&redirect_uri=567";

	const url = getRedirectURL({
		client_id: "321",
		redirect_uri: "567",
	});

	assert(url.toString() === expectedURL);
});

Deno.test("AuthCode: getRedirectURL with additional options", () => {
	const expectedURL =
		"https://accounts.spotify.com/authorize?response_type=code&scope=playlist-read-private+user-library-modify+streaming&client_id=321&redirect_uri=567&show_dialog=false&state=123";

	const url = getRedirectURL({
		client_id: "321",
		redirect_uri: "567",
		scopes: ["playlist-read-private", "user-library-modify", "streaming"],
		show_dialog: false,
		state: "123",
	});

	assert(url.toString() === expectedURL);
});

Deno.test("AuthCode: getGrantData", async () => {
	mockFetch.install();

	const mockRequest: GetGrantDataOpts = {
		client_id: crypto.randomUUID(),
		client_secret: crypto.randomUUID(),
		code: crypto.randomUUID(),
		redirect_uri: "http://localhost:3000/callback",
	};

	const mockResponse: KeypairResponse = {
		access_token: crypto.randomUUID(),
		refresh_token: crypto.randomUUID(),
		expires_in: 3600,
		token_type: "Bearer",
		scope: (["playlist-modify-public"] as AuthScope[]).join(" "),
	};

	mockFetch.mock("POST@/api/token", (req) => {
		const encoded = req.headers.get("Authorization");
		if (
			encoded !==
				getBasicAuthHeader(mockRequest.client_id, mockRequest.client_secret)
		) {
			return new Response("Unauthorized", { status: 401 });
		}

		const params = Object.fromEntries(new URL(req.url).searchParams) as Partial<
			ApiTokenReqParams
		>;

		if (
			params["code"] !== mockRequest.code ||
			params["redirect_uri"] !== mockRequest.redirect_uri ||
			params["grant_type"] !== "authorization_code"
		) {
			return new Response("Bad request", { status: 400 });
		}

		return new Response(JSON.stringify(mockResponse));
	});

	// Test success case
	const keypair = await getGrantData(mockRequest);
	assertEquals(keypair, mockResponse);

	// Test error case
	mockFetch.mock(
		"POST@/api/token",
		() => new Response("Error", { status: 500 }),
	);
	await assertRejects(
		async () => await getGrantData(mockRequest),
		SpotifyAuthError,
		"Error",
	);

	mockFetch.uninstall();
});

Deno.test("AuthCode: refresh", async () => {
	mockFetch.install();

	const mockRequest = {
		client_id: crypto.randomUUID(),
		client_secret: crypto.randomUUID(),
		refresh_token: crypto.randomUUID(),
	};

	const mockResponse: ScopedAccessResponse = {
		access_token: crypto.randomUUID(),
		expires_in: 3600,
		token_type: "Bearer",
		scope: (["playlist-modify-public"] as AuthScope[]).join(" "),
	};

	mockFetch.mock("POST@/api/token", (req) => {
		const encoded = req.headers.get("Authorization");
		if (
			encoded !==
				getBasicAuthHeader(mockRequest.client_id, mockRequest.client_secret)
		) {
			return new Response("Unauthorized", { status: 401 });
		}

		const params = Object.fromEntries(new URL(req.url).searchParams) as Partial<
			ApiTokenReqParams
		>;

		if (
			params["refresh_token"] !== mockRequest.refresh_token ||
			params["grant_type"] !== "refresh_token"
		) {
			return new Response("Bad request", { status: 400 });
		}

		return new Response(JSON.stringify(mockResponse));
	});

	const res = await refresh(mockRequest);
	assertEquals(res, mockResponse);

	mockFetch.mock(
		"POST@/api/token",
		() => new Response("Error", { status: 500 }),
	);
	await assertRejects(
		async () => await refresh(mockRequest),
		SpotifyAuthError,
		"Error",
	);

	mockFetch.uninstall();
});

describe("AuthProvider", () => {
	const mockConfig: AuthProviderConfig = {
		client_id: crypto.randomUUID(),
		client_secret: crypto.randomUUID(),
		access_token: "test_access_token",
		refresh_token: "test_refresh_token",
	};

	const mockResponse: ScopedAccessResponse = {
		access_token: "new_test_access_token",
		token_type: "Bearer",
		scope: "user-read-private",
		expires_in: 3600,
	};

	Deno.test("AuthCode: constructor", () => {
		const authProvider = new AuthProvider(mockConfig);
		assertEquals(authProvider.getToken(), mockConfig.access_token);
	});

	Deno.test("AuthCode: constructor without access token", () => {
		const { access_token: _, ...config } = mockConfig;
		const authProvider = new AuthProvider(config);
		assertEquals(authProvider.getToken(), "");
	});

	Deno.test("AuthCode: refreshToken", async () => {
		mockFetch.install();
		mockFetch.mock(
			"POST@/api/token",
			() => (new Response(JSON.stringify(mockResponse))),
		);

		const authProvider = new AuthProvider(mockConfig);
		const token = await authProvider.refreshToken();

		assertEquals(token, mockResponse.access_token);
		assertEquals(authProvider.getToken(), mockResponse.access_token);

		mockFetch.uninstall();
	});

	Deno.test("AuthCode: refreshToken with error", async () => {
		const errorMessage = "Some error occurred";
		mockFetch.install();
		mockFetch.mock(
			"POST@/api/token",
			() => (new Response(errorMessage, { status: 500 })),
		);

		const authProvider = new AuthProvider(mockConfig);
		await assertRejects(
			async () => {
				await authProvider.refreshToken();
			},
			SpotifyAuthError,
			errorMessage,
		);

		mockFetch.uninstall();
	});

	Deno.test("AuthCode: onRefresh", async () => {
		const onRefreshSpy = spy();
		const authProvider = new AuthProvider(mockConfig, {
			onRefresh: onRefreshSpy,
		});

		mockFetch.install();
		mockFetch.mock(
			"POST@/api/token",
			() => (new Response(JSON.stringify(mockResponse))),
		);

		const token = await authProvider.refreshToken();

		assertSpyCall(onRefreshSpy, 0, { args: [mockResponse] });
		assertSpyCalls(onRefreshSpy, 1);
		assert(token === mockResponse.access_token);

		mockFetch.uninstall();
	});

	Deno.test("AuthCode: onRefreshFailure", async () => {
		const onRefreshFailureSpy = spy();
		const authProvider = new AuthProvider(mockConfig, {
			onRefreshFailure: onRefreshFailureSpy,
		});

		mockFetch.install();
		mockFetch.mock(
			"POST@/api/token",
			() => (new Response("error", { status: 500 })),
		);

		const error = new SpotifyAuthError("error", 500);

		await assertRejects(
			() => authProvider.refreshToken(),
			SpotifyAuthError,
		);

		assertSpyCall(onRefreshFailureSpy, 0, { args: [error] });
		assertSpyCalls(onRefreshFailureSpy, 1);

		mockFetch.uninstall();
	});
});
