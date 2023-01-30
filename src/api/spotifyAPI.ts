import { API_PREFIX } from "./consts.ts";
import { UserPrivate } from "./types/user.ts";

class SpotifyAPI {
  private accessToken?: string;

  constructor() {}

  async getMe() {
    const res = await fetch(`${API_PREFIX}/me`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return (await res.json()) as UserPrivate;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }
}

export const spotifyAPI = new SpotifyAPI();
