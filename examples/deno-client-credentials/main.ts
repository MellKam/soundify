import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { cleanEnv } from "https://deno.land/x/envalid@0.1.2/envalid.ts";
import { str } from "https://deno.land/x/envalid@0.1.2/validators.ts";
import { ClientCredentials, createSpotifyAPI } from "soundify";

// get env variables from `.env` file
const env = cleanEnv(config(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
});

const authProvider = new ClientCredentials({
	client_id: env.SPOTIFY_CLIENT_ID,
	client_secret: env.SPOTIFY_CLIENT_SECRET,
}).createAuthProvider();

const spotifyAPI = createSpotifyAPI(authProvider);

const searchResult = await spotifyAPI.search(
	"Linkin Park",
	"artist",
);

const linkinPark = searchResult.artists.items[0];

console.log(linkinPark.name);

const topTracks = await spotifyAPI.getArtistTopTracks(
	linkinPark.id,
	"PL",
);

for (const track of topTracks) {
	console.log(track.name);
}
