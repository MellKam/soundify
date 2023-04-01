import {
	assert,
	assertEquals,
	assertRejects,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { describe } from "https://deno.land/std@0.182.0/testing/bdd.ts";
import { AuthCode, AuthCodeCredentials, AuthProvider } from "auth/auth_code.ts";
import {
	ApiTokenReqParams,
	AuthScope,
	KeypairResponse,
	ScopedAccessResponse,
	SpotifyAuthError,
} from "auth/general.ts";
import * as mockFetch from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
	assertSpyCall,
	assertSpyCalls,
	spy,
} from "https://deno.land/std@0.182.0/testing/mock.ts";

const creds: AuthCodeCredentials = {
	client_id: crypto.randomUUID(),
	client_secret: crypto.randomUUID(),
};

const redirect_uri = "http://localhost:3000/callback";

const authFlow = new AuthCode(creds);

Deno.test("AuthCode: constructro", () => {
	assertEquals(authFlow["creds"], creds);
});

Deno.test("AuthCode: getAuthURL", () => {
	const expectedURL =
		`https://accounts.spotify.com/authorize?response_type=code&client_id=${
			encodeURIComponent(creds.client_id)
		}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

	const url = authFlow.getAuthURL({
		redirect_uri,
	});

	assert(url.toString() === expectedURL);
});

Deno.test("AuthCode: getAuthURL with additional options", () => {
	const expectedURL =
		`https://accounts.spotify.com/authorize?response_type=code&scope=playlist-read-private+user-library-modify+streaming&client_id=${
			encodeURIComponent(creds.client_id)
		}&show_dialog=false&state=123&redirect_uri=${
			encodeURIComponent(redirect_uri)
		}`;

	const url = authFlow.getAuthURL({
		scopes: ["playlist-read-private", "user-library-modify", "streaming"],
		show_dialog: false,
		state: "123",
		redirect_uri,
	});

	assertEquals(
		Object.fromEntries(url.searchParams),
		Object.fromEntries(new URL(expectedURL).searchParams),
	);
});

Deno.test("AuthCode: getGrantData", async () => {
	mockFetch.install();

	const mockCode = crypto.randomUUID();

	const mockResponse: KeypairResponse = {
		access_token: crypto.randomUUID(),
		refresh_token: crypto.randomUUID(),
		expires_in: 3600,
		token_type: "Bearer",
		scope: (["playlist-modify-public"] as AuthScope[]).join(" "),
	};

	mockFetch.mock("POST@/api/token", (req) => {
		const encoded = req.headers.get("Authorization");
		if (encoded !== authFlow["basicAuthHeader"]) {
			return new Response("Unauthorized", { status: 401 });
		}

		const params = Object.fromEntries(new URL(req.url).searchParams) as Partial<
			ApiTokenReqParams
		>;

		if (
			params["code"] !== mockCode ||
			params["redirect_uri"] !== redirect_uri ||
			params["grant_type"] !== "authorization_code"
		) {
			return new Response("Bad request", { status: 400 });
		}

		return new Response(JSON.stringify(mockResponse));
	});

	// Test success case
	const keypair = await authFlow.getGrantData(redirect_uri, mockCode);
	assertEquals(keypair, mockResponse);

	// Test error case
	mockFetch.mock(
		"POST@/api/token",
		() => new Response("Error", { status: 500 }),
	);
	await assertRejects(
		async () => await authFlow.getGrantData(redirect_uri, mockCode),
		SpotifyAuthError,
		"Error",
	);

	mockFetch.uninstall();
});

Deno.test("AuthCode: refresh", async () => {
	mockFetch.install();

	const refreshToken = crypto.randomUUID();

	const mockResponse: ScopedAccessResponse = {
		access_token: crypto.randomUUID(),
		expires_in: 3600,
		token_type: "Bearer",
		scope: (["playlist-modify-public"] as AuthScope[]).join(" "),
	};

	mockFetch.mock("POST@/api/token", (req) => {
		const encoded = req.headers.get("Authorization");
		if (encoded !== authFlow["basicAuthHeader"]) {
			return new Response("Unauthorized", { status: 401 });
		}

		const params = Object.fromEntries(new URL(req.url).searchParams) as Partial<
			ApiTokenReqParams
		>;

		if (
			params["refresh_token"] !== refreshToken ||
			params["grant_type"] !== "refresh_token"
		) {
			return new Response("Bad request", { status: 400 });
		}

		return new Response(JSON.stringify(mockResponse));
	});

	const res = await authFlow.refresh(refreshToken);
	assertEquals(res, mockResponse);

	mockFetch.mock(
		"POST@/api/token",
		() => new Response("Error", { status: 500 }),
	);
	await assertRejects(
		async () => await authFlow.refresh(refreshToken),
		SpotifyAuthError,
		"Error",
	);

	mockFetch.uninstall();
});

describe("AuthProvider", () => {
	const refresh_token = "test_refresh_token";
	const access_token = "test_access_token";

	const mockResponse: ScopedAccessResponse = {
		access_token: "new_test_access_token",
		token_type: "Bearer",
		scope: "user-read-private",
		expires_in: 3600,
	};

	Deno.test("AuthCode: constructor", () => {
		const authProvider = new AuthProvider(authFlow, refresh_token, {
			access_token,
		});
		assertEquals(authProvider.getToken(), access_token);
	});

	Deno.test("AuthCode: constructor without access token", () => {
		const authProvider = new AuthProvider(authFlow, refresh_token);
		assertEquals(authProvider.getToken(), "");
	});

	Deno.test("AuthCode: refreshToken", async () => {
		mockFetch.install();
		mockFetch.mock(
			"POST@/api/token",
			() => (new Response(JSON.stringify(mockResponse))),
		);

		const authProvider = new AuthProvider(authFlow, refresh_token);
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

		const authProvider = new AuthProvider(authFlow, refresh_token);
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
		const authProvider = new AuthProvider(authFlow, refresh_token, {
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
		const authProvider = new AuthProvider(authFlow, refresh_token, {
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
