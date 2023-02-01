import { assertEquals } from "https://deno.land/std@0.175.0/testing/asserts.ts";
import { cleanEnv, str } from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { getCurrentUserProfile, SpotifyAuthService } from "../../src/mod.ts";

const env = cleanEnv(Deno.env.toObject(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
	SPOTIFY_REFRESH_TOKEN: str(),
});

Deno.test("test auth", async () => {
	const authService = new SpotifyAuthService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
		SPOTIFY_REDIRECT_URI: "",
	});

	const { access_token } = await authService.refreshAccessToken(
		env.SPOTIFY_REFRESH_TOKEN,
	);

	const user = await getCurrentUserProfile(`Bearer ${access_token}`);
	console.log(user);

	assertEquals(user.id, "zksczw19rao4pcfdft6o7nn8g");
});
