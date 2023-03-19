import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { cleanEnv } from "https://deno.land/x/envalid@0.1.2/envalid.ts";
import { str } from "https://deno.land/x/envalid@0.1.2/validators.ts";
import { ClientCredentials, getArtist, SpotifyClient } from "soundify";

// get env variables from `.env` file
const env = cleanEnv(config(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
});

const client = new SpotifyClient(
	new ClientCredentials.AuthProvider({
		client_id: env.SPOTIFY_CLIENT_ID,
		client_secret: env.SPOTIFY_CLIENT_SECRET,
	}),
);

const linkinPark = await getArtist(client, "6XyY86QOPPrYVGvF9ch6wz");
console.log(linkinPark);
