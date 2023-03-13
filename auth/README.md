# Soundify Authorization

<a href="https://bundlejs.com/?q=%40soundify%2Fweb-auth">
  <img src="https://img.shields.io/badge/dynamic/json?color=1DB954&label=%40soundify%2Fweb-auth&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fweb-auth" alt="soundify/web-auth">
</a>

If you have no experience with Spotify Auth you can read more about it in the
[Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/).

## Auth Flows

Authorization flows are organized into separate namespaces, with each namespace
containing all the necessary functions and classes to implement a specific
authorization flow. This allows for easy importing of a specific flow.

For instance, the following code imports all authorization flow namespaces:

```ts
import {
	// Authorization Code flow
	AuthCode,
	// Client Credentials flow
	ClientCredentials,
	// Implicit Grant flow
	ImplicitGrant,
	// Authorization Code flow with PKCE
	PKCEAuthCode,
} from "@soundify/node-auth";
```

You can take a look at the examples to see how to use each authorization flow.

- Authorization Code flow -
  [examples/node-express-auth](https://github.com/MellKam/soundify/tree/main/examples/node-express-auth),
  [examples/next-ssr](https://github.com/MellKam/soundify/tree/main/examples/next-ssr),
  [examples/deno-oak-auth](https://github.com/MellKam/soundify/tree/main/examples/deno-oak-auth)
- Authorization Code flow with PKCE -
  [examples/react-pkce-auth](https://github.com/MellKam/soundify/tree/main/examples/react-pkce-auth)
- Client Credentials flow - TBD
- Implicit Grant flow -
  [examples/react-implicit-grant](https://github.com/MellKam/soundify/tree/main/examples/react-implicit-grant)

## Auth provider and automatic tokens refreshing

As you saw earlier, you can simply pass the Access Token to SpotifyClient. But
after some time (1 hour to be exact), it will expire and you'll need to deal
with it yourself. Somehow get a new Access Token and set it on the client.

```ts
import { SpotifyClient } from "@soundify/api";

const client = new SpotifyClient("ACCESS_TOKEN");
// ...
// Oops, token expires :(
client.setAccessor("NEW_ACCESS_TOKEN");
```

But if you don't want to deal with all that, you can just create an
`AccessProvider` and pass it instead of the Access Token.

```ts
import { SpotifyClient } from "@soundify/api";
import { AuthCode } from "@soundify/node-auth";

const authProvider = new AuthCode.AccessProvider({
	client_id: "YOUR_SPOTIFY_CLIENT_ID",
	client_secret: "YOUR_SPOTIFY_CLIENT_SECRET",
	refresh_token: "YOUR_REFRESH_TOKEN",
});

const client = new SpotifyClient(authProvider);
```

You can create an `AccessProvider` from `AuthCode`, `PKCEAuthCode`,
`ClientCredentials` flows. Implicit grant does not allow you to implement such a
thing.

## Auth Scopes

Scopes are usually used when creating authorization url. Pay attention to them,
because many fields and endpoints may not be available if the correct scopes are
not specified. Read the
[Spotify guide](https://developer.spotify.com/documentation/general/guides/authorization/scopes/)
to learn more.

In Soundify scopes can be used as strings or with const object `SCOPES`.

```ts
import { SCOPES, AuthCode } from "@soundify/node-auth";

AuthCode.getAuthURL({
  scopes: ["user-read-email"],
  // or like this
  scopes: [SCOPES.USER_READ_EMAIL]
  // or use all scopes
  scopes: Object.values(SCOPES),
})
```

All contributions are very welcome ❤️
