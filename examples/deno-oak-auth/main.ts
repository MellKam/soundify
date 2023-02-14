import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { cleanEnv, str, url } from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { AuthCodeService } from "../../mod.ts";
// If you want to copy this code, change this import path to
// `https://deno.land/x/soundify/mod.ts`

const PORT = 3000;

/**
 * You can create your app and get all the secrets here
 * Spoity Dashboard - `https://developer.spotify.com/dashboard`
 */
const env = cleanEnv(config(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
	/**
	 * Make sure that in the dashboard of your Spotify app,
	 * in Settings -> Redirect URIs, this link is specified:
	 *
	 * @link `http://localhost:${PORT}/callback`
	 *
	 * @var PORT - variable that exists above. By default it is `3000`
	 */
	SPOTIFY_REDIRECT_URI: url(),
});

const authService = new AuthCodeService(env);

const app = new Application();
const router = new Router();

router
	.get("/login", (ctx) => {
		const state = crypto.randomUUID();
		ctx.cookies.set("state", state, {
			httpOnly: true,
		});

		const authURL = authService.getAuthURL({
			scopes: ["user-read-email"],
			state,
		});
		ctx.response.redirect(authURL);
	})
	.get("/callback", async (ctx) => {
		const state = await ctx.cookies.get("state");
		if (!state) {
			ctx.response.body =
				"Unable to find `state` in cookies to verify request.";
			ctx.response.status = 400;
			return;
		}

		try {
			const grantData = await authService.getGrantData(
				ctx.request.url.searchParams,
				state,
			);

			ctx.response.body = grantData;
		} catch (error) {
			ctx.response.body = String(error);
		}
	});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", (listener) => {
	console.log(
		`✅ Server successfully started!`,
	);
	console.log(
		`Let's try it -> http://localhost:${listener.port}/login`,
	);
});

await app.listen({ port: PORT });
