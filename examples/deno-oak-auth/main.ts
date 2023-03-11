import {
	Application,
	createHttpError,
	isHttpError,
	Router,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { cleanEnv, str, url } from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { AuthCode } from "../../mod.ts";
// If you want to copy this code, change this import path to
// `https://deno.land/x/soundify/mod.ts`

const PORT = 3000;

const env = cleanEnv(config(), {
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
	SPOTIFY_REDIRECT_URI: url(),
});

const app = new Application();

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		if (isHttpError(err)) {
			ctx.response.status = err.status;
		} else {
			ctx.response.status = 500;
		}
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

		ctx.response.redirect(AuthCode.getAuthURL({
			scopes: ["user-read-email"],
			state,
			client_id: env.SPOTIFY_CLIENT_ID,
			redirect_uri: env.SPOTIFY_REDIRECT_URI,
		}));
	})
	.get("/callback", async (ctx) => {
		const error = ctx.request.url.searchParams.get("error");
		if (error) {
			throw createHttpError(400, error);
		}

		const code = ctx.request.url.searchParams.get("code");
		if (!code) {
			throw createHttpError(400, "Cannot find `code` in search params");
		}

		const state = ctx.request.url.searchParams.get("state");
		const storedState = await ctx.cookies.get("state");
		if (!storedState || !state || state !== storedState) {
			throw createHttpError(401, "Unable to verify request with state.");
		}

		ctx.cookies.delete("state");

		const grantData = await AuthCode.getGrantData(
			{
				client_id: env.SPOTIFY_CLIENT_ID,
				client_secret: env.SPOTIFY_CLIENT_SECRET,
				redirect_uri: env.SPOTIFY_REDIRECT_URI,
				code,
			},
		);

		console.log(grantData);
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
