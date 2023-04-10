import {
  AccessResponse,
  AuthProviderOpts,
  createAuthProvider,
  getBasicAuthHeader,
  SPOTIFY_AUTH,
  SpotifyAuthError,
  URL_ENCODED
} from "./general";

export class ClientCredentials {
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

    if (!res.ok) throw await SpotifyAuthError.create(res);

    return (await res.json()) as AccessResponse;
  }

  createAuthProvider(
    opts?: Omit<AuthProviderOpts<AccessResponse>, "refresher">
  ) {
    return createAuthProvider({
      refresher: this.getAccessToken.bind(this),
      ...opts
    });
  }
}
