import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
	cleanEnv,
	num,
	str,
	url,
} from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { AuthCodeService } from "../../mod.ts";

const env = cleanEnv(Deno.env.toObject(), {
	PORT: num(),
	SPOTIFY_CLIENT_ID: str(),
	SPOTIFY_CLIENT_SECRET: str(),
	SPOTIFY_REDIRECT_URI: url(),
});

const app = new Application();
const router = new Router();

const authService = new AuthCodeService(env);

router
	.get("/login", (ctx) => {
		const state = crypto.randomUUID();

		const authURL = authService.getAuthURL({
			scopes: ["user-read-email"],
			state,
		});

		ctx.cookies.set("state", state, {
			httpOnly: true,
		});
		ctx.response.redirect(authURL);
	})
	.get("/callback", async (ctx) => {
		const state = await ctx.cookies.get("state");
		if (!state) {
			ctx.response.body = "Can't find state";
			return;
		}

		try {
			const keypairData = await authService.getGrantData(
				ctx.request.url.searchParams,
				state,
			);

			ctx.response.body = keypairData;
		} catch (error) {
			ctx.response.body = String(error);
		}
	});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => {
	console.log(
		`To get OAuth tokens, navigate to: http://localhost:${env.PORT}/login`,
	);
});

await app.listen({ port: env.PORT });
