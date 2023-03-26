export {
	type AccessResponse,
	type AuthCodeCallbackData,
	type AuthCodeCallbackError,
	type AuthCodeCallbackSuccess,
	type AuthScope,
	type KeypairResponse,
	type ScopedAccessResponse,
	SCOPES,
	SpotifyAuthError,
} from "auth/general.ts";

export * as AuthCode from "auth/auth_code.ts";
export * as PKCEAuthCode from "auth/pkce_auth_code.ts";
export * as ClientCredentials from "auth/client_credentials.ts";
export * as ImplicitGrant from "auth/implicit_grant.ts";
