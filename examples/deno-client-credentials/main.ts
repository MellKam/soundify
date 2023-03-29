import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { cleanEnv } from "https://deno.land/x/envalid@0.1.2/envalid.ts";
import { str } from "https://deno.land/x/envalid@0.1.2/validators.ts";
import { ClientCredentials, createSpotifyAPI, SpotifyClient } from "soundify";

// get env variables from `.env` file
const env = cleanEnv(config(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
});

const authProvider = new ClientCredentials({
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
}).createAuthProvider();

const spotifyAPI = createSpotifyAPI(new SpotifyClient(authProvider));

const linkinPark = await spotifyAPI.getArtist("6XyY86QOPPrYVGvF9ch6wz");
console.log(linkinPark);
