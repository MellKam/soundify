import { IAuthProvider } from "../shared";
import {
  AccessResponse,
  getBasicAuthHeader,
  SPOTIFY_AUTH,
  AuthError,
  URL_ENCODED
} from "./general";

/**
 * Client Credentials Flow
 */
export class ClientCredentialsFlow {
  private readonly basicAuthHeader: string;

  constructor(creds: { client_id: string; client_secret: string }) {
    this.basicAuthHeader = getBasicAuthHeader(
      creds.client_id,
      creds.client_secret
    );
  }

  async getAccessToken() {
    const res = await fetch(SPOTIFY_AUTH + "api/token", {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": URL_ENCODED
      },
      body: new URLSearchParams({
        grant_type: "client_credentials"
      })
    });

    if (!res.ok) throw await AuthError.create(res);

    return (await res.json()) as AccessResponse;
  }

  createRefresher() {
    return this.getAccessToken.bind(this);
  }

  createAuthProvider(access_token?: string): IAuthProvider {
    const refresher = this.createRefresher();
    return {
      refresh: async () => (await refresher()).access_token,
      token: access_token
    };
  }
}
