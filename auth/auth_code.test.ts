import {
	assert,
	assertEquals,
	assertRejects,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import {
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
