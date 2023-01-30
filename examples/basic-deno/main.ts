import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  cleanEnv,
  num,
  str,
  url,
} from "https://deno.land/x/envalid@0.1.2/mod.ts";
import { SpotifyAuthService } from "../../src/mod.ts";

const env = cleanEnv(Deno.env.toObject(), {
  PORT: num(),
  SPOTIFY_CLIENT_ID: str(),
  SPOTIFY_CLIENT_SECRET: str(),
  SPOTIFY_REDIRECT_URI: url(),
});

const app = new Application();
const router = new Router();
const spotifyAuthService = new SpotifyAuthService(env);

router
  .get("/login", (ctx) => {
    const state = crypto.randomUUID();

    const redirectURL = spotifyAuthService.getRedirectAuthURI({
      scopes: ["user-read-email"],
      state,
    });

    ctx.cookies.set("state", state);
    ctx.response.redirect(redirectURL);
  })
  .get("/callback", async (ctx) => {
    const code = ctx.request.url.searchParams.get("code");
    if (!code) {
      ctx.response.body = "No code provided";
      return;
    }

    const state = await ctx.cookies.get("state");
    const expectedState = ctx.request.url.searchParams.get("state");

    if (!state || !expectedState || state != expectedState) {
      ctx.response.body = "Wrong state";
      return;
    }

    const data = await spotifyAuthService.getKeypairByAuthCode(code);
    ctx.response.body = data;
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ secure, hostname }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${env.PORT}`;
  console.log(`To get OAuth tokens, navigate to: ${url}/login`);
});

async function main() {
  await app.listen({ port: env.PORT });
}

if (import.meta.main) {
  await main();
}
