import * as oauth from "oauth4webapi";
import { OAuthScope } from "@soundify/web-api/auth";
import { env } from "./env.ts";

const issuer = new URL("https://accounts.spotify.com/");
const authServer = await oauth.processDiscoveryResponse(
	issuer,
	await oauth.discoveryRequest(issuer),
);

const oauthClient: oauth.Client = {
	client_id: env.SPOTIFY_CLIENT_ID,
	token_endpoint_auth_method: "none",
};

export class OAuthError extends Error {
	constructor(public readonly params: oauth.OAuth2Error) {
		super(
			params.error +
				(params.error_description ? " : " + params.error_description : ""),
		);
	}
}

export function createAuthUrl(
	codeChallenge: string,
	scopes?: OAuthScope[],
	state?: string,
) {
	const authUrl = new URL(authServer.authorization_endpoint!);

	for (
		const [key, value] of Object.entries({
			client_id: env.SPOTIFY_CLIENT_ID,
			redirect_uri: env.SPOTIFY_REDIRECT_URI,
			response_type: "code",
			code_challenge: codeChallenge,
			code_challenge_method: "S256",
		})
	) {
		authUrl.searchParams.set(key, value);
	}

	if (scopes && scopes.length > 0) {
		authUrl.searchParams.set("scope", scopes.join(" "));
	}

	if (state) {
		authUrl.searchParams.set("state", state);
	}

	return authUrl;
}

export async function processCallback(
	url: URL,
	codeVerifier: string,
	expectedState?: string,
) {
	const params = oauth.validateAuthResponse(
		authServer,
		oauthClient,
		url,
		expectedState,
	);

	if (oauth.isOAuth2Error(params)) {
		throw new OAuthError(params);
	}

	const response = await oauth.authorizationCodeGrantRequest(
		authServer,
		oauthClient,
		params,
		env.SPOTIFY_REDIRECT_URI,
		codeVerifier,
	);
	const result = await oauth.processAuthorizationCodeOAuth2Response(
		authServer,
		oauthClient,
		response,
	);

	if (oauth.isOAuth2Error(result)) {
		throw new OAuthError(result);
	}

	if (!result.refresh_token) {
		throw new Error("No refresh token in response");
	}

	return result as {
		refresh_token: string;
		access_token: string;
		token_type: string;
		expires_in?: number;
		scope?: string;
	};
}

export async function refresh(refreshToken: string) {
	const response = await oauth.refreshTokenGrantRequest(
		authServer,
		oauthClient,
		refreshToken,
	);
	const result = await oauth.processRefreshTokenResponse(
		authServer,
		oauthClient,
		response,
	);

	if (oauth.isOAuth2Error(result)) {
		throw new OAuthError(result);
	}

	if (!result.refresh_token) {
		throw new Error("No refresh token in response");
	}

	return result as {
		refresh_token: string;
		access_token: string;
		token_type: string;
		expires_in?: number;
		scope?: string;
	};
}
