<div align="center">
  <p align="center">
     <img align="center" width="500px" src="https://svgshare.com/i/rf9.svg">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@soundify/api">
      <img alt="npm" src="https://img.shields.io/npm/v/@soundify/api?color=509BF5">
    </a>
    <a href="https://deno.land/x/soundify">
      <img alt="deno.land" src="https://img.shields.io/github/v/tag/MellKam/soundify?color=509BF5&label=deno.land%2Fx&logo=deno">
    </a>
    <a href="https://github.com/MellKam/soundify/blob/main/LICENSE">
      <img alt="license" src="https://img.shields.io/github/license/MellKam/soundify?color=509BF5">
    </a>
    <a href="https://github.com/MellKam/soundify/commits/main">
      <img src="https://img.shields.io/github/last-commit/MellKam/soundify?color=509BF5" alt="Last commit" />
    </a>
    <a href="https://github.com/MellKam/soundify/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/MellKam/soundify/ci.yaml?color=509BF5&label=CI&logo=github" alt="GitHub CI Status" />
    </a>
  </p>
</div>

<div align="center">
  <p align="center">
    Soundify is a lightweight and flexible library for seamless communication with Spotify API, designed to work smoothly with TypeScript, Deno, Node.js, and client-side JavaScript. It's open source and provides an easy-to-use interface for accessing Spotify's data.
  </p>
</div>

# Features ✨

- 💻 Multiruntime: Works seamlessly with Node.js, Deno, and the Browser environment.
- 🚀 Modern: Leverages native web APIs like `fetch`, `crypto`,
  `URLSearchParams`, etc.
- 🔑 Comprehensive auth support: It can handle all Spotify Auth flows and
  automatically refreshes access token.
- 📦 Lightweight and treeshakable: It is designed with care for your bundle
  size.
- 🆎 Strictly typed: All entities returned by the api have exact and up to date
  types.
- 📖 Great docs: The library comes with extensive documentation and lots of
  examples.

# Installation

## [NPM](https://www.npmjs.com/org/soundify)

Packages:

- [@soundify/api](https://www.npmjs.com/package/@soundify/api) - Provides client, endpoints and entity types. Can be used both in the browser and in nodejs 
- [@soundify/web-auth](https://www.npmjs.com/package/@soundify/web-auth) - Spotify authorization for browser
- [@soundify/node-auth](https://www.npmjs.com/package/@soundify/node-auth) - Spotify authorization for nodejs

> The only difference in `web-auth` and `node-auth` packages is that under the hood they use different platform api to perform the
> same tasks. The use of the library api remains the same.

This is minified bundle size of each package without treeshaking

<p>
  <a href="https://bundlejs.com/?q=%40soundify%2Fapi">
    <img src="https://img.shields.io/badge/dynamic/json?color=509BF5&label=%40soundify%2Fapi&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fapi@latest" alt="@soundify/api">
  </a>
  <a href="https://bundlejs.com/?q=%40soundify%2Fnode-auth">
    <img src="https://img.shields.io/badge/dynamic/json?color=509BF5&label=%40soundify%2Fnode-auth&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fnode-auth@latest" alt="soundify/node-auth">
  </a>
  <a href="https://bundlejs.com/?q=%40soundify%2Fweb-auth">
    <img src="https://img.shields.io/badge/dynamic/json?color=509BF5&label=%40soundify%2Fweb-auth&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fweb-auth@latest" alt="soundify/web-auth">
  </a>
</p>

## [Deno](https://deno.land/x/soundify)

Deno is straightforward, you can just import the package from deno.land and use all the functionality.
```ts
import { ... } from "https://deno.land/x/soundify/mod.ts"
```

# Gettings started

To make your first request with Soundify, you need to create a `SpotifyClient`, the purpose of which is to create an http requests to spotify. As the first parameter it takes access token or [AuthProvider](#auth-provider-and-automatic-tokens-refreshing).

```ts
import { SpotifyClient } from "@soundify/api";

const client = new SpotifyClient("ACCESS_TOKEN");
```

If you've used other api libraries, you can expect something like a bunch of methods on a single class, but in our case the default recommendation is to use endpoint functions that take the client as the first argument:

```ts
import { SpotifyClient, getCurrentUser } from "@soundify/api"

const client = new SpotifyClient("ACCESS_TOKEN");
const user = await getCurrentUser(client);

console.log(user)
```

If your Access Token is valid it will output something like this

```js
{
  "id": "31xofk5q7l22rvsbff7yiechyx6i",
  "display_name": "Soundify",
  "type": "user",
  "uri": "spotify:user:31xofk5q7l22rvsbff7yiechyx6i",
  // etc...
}
```

This may be inconvenient for some users, but it was done primarily to provide a way to treeshake so that clients don't send a lot of unused code.

If you are writing a backend or don't care about the size of the library you can use the `createSpotifyAPI()` function which will bind all the endpoint functions to the client. That way you can use this object throughout your application and not have to worry about imports.

```ts
import { SpotifyClient, createSpotifyAPI } from "@soundify/api";

const api = createSpotifyAPI("ACCESS_TOKEN");
const user = await api.getCurrentUser();

console.log(user);
```

# Authorization

If you have no experience with Spotify Auth you can read more about it in the
[Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization).

## Authorization Code flow

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
- Client Credentials flow - [examples/deno-client-credentials](https://github.com/MellKam/soundify/tree/main/examples/deno-client-credentials)
- Implicit Grant flow -
  [examples/react-implicit-grant](https://github.com/MellKam/soundify/tree/main/examples/react-implicit-grant)

## Auth provider and automatic tokens refreshing

As you saw earlier, you can simply pass the Access Token to SpotifyClient. But
after some time (1 hour to be exact), it will expire and you'll need to deal
with it yourself. Somehow get a new Access Token and set it on the client.

```ts
import { SpotifyClient } from "@soundify/api";
import { AuthCode } from "@soundify/node-auth";

const authFlow = new AuthCode({ ... });
const client = new SpotifyClient("ACCESS_TOKEN");
// ...
// Oops, token expires :(

const { access_token } = await authFlow.refresh("REFRESH_TOKEN");
// set new token to your client
client.setAuthProvider(access_token);
```

But if you don't want to deal with all that, you can just create an
`AuthProvider` and pass it instead of the Access Token. It will automatically refresh your token.

```ts
import { SpotifyClient } from "@soundify/api";
import { AuthCode } from "@soundify/node-auth";

const authProvider = new AuthCode.AuthProvider({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  refresh_token: "YOUR_REFRESH_TOKEN",
});

const client = new SpotifyClient(authProvider);
```

You can create an `AuthProvider` from `AuthCode`, `PKCEAuthCode`,
`ClientCredentials` flows. Implicit grant does not allow you to implement such a
thing.

### Refresh Events

AuthProvider provides an additional option for callback events that may be usefull in some cases.

```ts
import { PKCEAuthCode } from "@soundify/web-auth";

const authProvider = new PKCEAuthCode.AuthProvider(
  {
    client_id: "YOUR_CLIENT_ID",
    refresh_token: "YOUR_REFRESH_TOKEN",
    access_token: "YOUR_ACCESS_TOKEN",
  },
  {
    onRefresh: (data) => {
      // do something with new token
      // for example, store it in localStorage
      localStorage.setItem("access_token", data.access_token);
    },
    onRefreshFailure: (error) => {
      // do something with error
      // for example, ask user to login again
      location.replace(PKCEAuthCode.getAuthURL({ ... }));
    }
  }
);
```

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
