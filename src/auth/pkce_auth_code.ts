import { IAuthProvider, parseResponse, toQueryString } from "../shared";
import {
  ApiTokenReqParams,
  AuthorizeReqParams,
  AuthScope,
  KeypairResponse,
  parseCallbackData,
  SPOTIFY_AUTH,
  AuthError,
  URL_ENCODED,
  AuthErrorObject
} from "./general";

export type GetAuthURLOpts = {
  /**
   * The URI to redirect to after the user grants or denies permission.
   */
  redirect_uri: string;
  /**
   * PKCE code that you generated from `code_verifier`.
   * You can get it with the `getCodeChallenge` function.
   */
  code_challenge: string;
  /**
   * This provides protection against attacks such as
   * cross-site request forgery.
   */
  state?: string;
  /**
   * List of scopes.
   *
   * @default
   * If no scopes are specified, authorization will be granted
   * only to access publicly available information
   */
  scopes?: AuthScope[];
};

export type GetGrantDataOpts = {
  /**
   * The URI to redirect to after the user grants or denies permission.
   */
  redirect_uri: string;
  /**
   * The random code you generated before redirecting the user to spotify auth
   */
  code_verifier: string;
  /**
   * An authorization code that can be exchanged for an Access Token.
   * The code that Spotify produces after redirecting to `redirect_uri`.
   */
  code: string;
};

/**
 * Authorization Code with PKCE Flow
 */
export class PKCECodeFlow {
  private static VERIFIER_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  constructor(private readonly client_id: string) {}

  getAuthURL({ scopes, ...opts }: GetAuthURLOpts) {
    const url = new URL(SPOTIFY_AUTH + "authorize");

    url.search = toQueryString<AuthorizeReqParams>({
      response_type: "code",
      scope: scopes?.join(" "),
      code_challenge_method: "S256",
      client_id: this.client_id,
      ...opts
    });

    return url;
  }

  /**
   * Generates random PKCE Code Verifier
   *
   * The code verifier is a random string between 43 and 128 characters in length.
   *
   * @param length Must be between 43 and 128 characters
   * @default 64
   */
  static async generateCodeVerifier(length = 64) {
    const randomBytes = "_IS_NODE_"
      ? new Uint8Array((await import("node:crypto")).randomBytes(length))
      : crypto.getRandomValues(new Uint8Array(length));

    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
      codeVerifier +=
        PKCECodeFlow.VERIFIER_CHARS[
          randomBytes[i] % PKCECodeFlow.VERIFIER_CHARS.length
        ];
    }

    return codeVerifier;
  }

  static async getCodeChallenge(code_verifier: string) {
    if ("_IS_NODE_") {
      return (await import("node:crypto"))
        .createHash("sha256")
        .update(code_verifier)
        .digest("base64url");
    }

    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(code_verifier)
    );

    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /**
   * Shorthand for generating PKCE codes.
   * Uses `generateCodeVerifier` and `getCodeChallenge` under the hood.
   */
  static async generateCodes(verifierLength?: number) {
    const code_verifier = await this.generateCodeVerifier(verifierLength);
    const code_challenge = await this.getCodeChallenge(code_verifier);

    return { code_verifier, code_challenge };
  }

  static parseCallbackData = parseCallbackData;

  async getGrantData(opts: GetGrantDataOpts) {
    const url = new URL(SPOTIFY_AUTH + "api/token");
    url.search = toQueryString<ApiTokenReqParams>({
      grant_type: "authorization_code",
      client_id: this.client_id,
      ...opts
    });

    const res = await fetch(url, {
      headers: {
        "Content-Type": URL_ENCODED
      },
      method: "POST"
    });

    if (!res.ok) {
      throw new AuthError(
        await parseResponse<AuthErrorObject>(res),
        res.status
      );
    }

    return (await res.json()) as KeypairResponse;
  }

  /**
   * Requests a new token keypair using your old refresh token and client ID
   */
  async refresh(refresh_token: string) {
    const url = new URL(SPOTIFY_AUTH + "api/token");
    url.search = toQueryString<ApiTokenReqParams>({
      grant_type: "refresh_token",
      client_id: this.client_id,
      refresh_token
    });

    const res = await fetch(url, {
      headers: {
        "Content-Type": URL_ENCODED
      },
      method: "POST"
    });

    if (!res.ok) {
      throw new AuthError(
        await parseResponse<AuthErrorObject>(res),
        res.status
      );
    }

    return (await res.json()) as KeypairResponse;
  }

  createRefresher(refresh_token: string) {
    return (async () => {
      const data = await this.refresh(refresh_token);
      refresh_token = data.refresh_token;
      return data;
    }).bind(this);
  }

  createAuthProvider(
    refresh_token: string,
    access_token?: string
  ): IAuthProvider {
    const refresher = this.createRefresher(refresh_token);
    return {
      refresh: async () => (await refresher()).access_token,
      token: access_token
    };
  }
}
