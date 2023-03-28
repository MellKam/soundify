import {
	Application,
	createHttpError,
	isHttpError,
	Router,
} from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import {
	cleanEnv,
	num,
	str,
	url,
} from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { AuthCode } from "soundify";
// If you want to copy this code, change this import path to
// `https://deno.land/x/soundify/mod.ts`

// get env variables from `.env` file
const env = cleanEnv(config(), {
	PORT: num(),
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
	SPOTIFY_REDIRECT_URI: url(),
});

const app = new Application();

// middleware to handle errors
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.response.status = isHttpError(err) ? err.status : 500;
		ctx.response.body = { error: err.message };
		ctx.response.type = "json";
	}
});

const router = new Router();

router
	.get("/login", (ctx) => {
		const state = crypto.randomUUID();
		ctx.cookies.set("state", state, {
			httpOnly: true,
		});

		ctx.response.redirect(AuthCode.getRedirectURL({
			scopes: ["user-read-email"],
			state,
			client_id: env.SPOTIFY_CLIENT_ID,
			redirect_uri: env.SPOTIFY_REDIRECT_URI,
		}));
	})
	.get("/callback", async (ctx) => {
		const params = AuthCode.parseCallbackData(ctx.request.url.searchParams);

		if ("error" in params) {
			throw createHttpError(400, params.error);
		}

		const storedState = await ctx.cookies.get("state");
		if (!storedState || !params.state || params.state !== storedState) {
			throw createHttpError(401, "Unable to verify request with state.");
		}

		ctx.cookies.delete("state");

		const grantData = await AuthCode.getGrantData({
			client_id: env.SPOTIFY_CLIENT_ID,
			client_secret: env.SPOTIFY_CLIENT_SECRET,
			redirect_uri: env.SPOTIFY_REDIRECT_URI,
			code: params.code,
		});

		console.log(grantData);
		ctx.response.body = "Success! Check server logs";
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

await app.listen({ port: env.PORT });
