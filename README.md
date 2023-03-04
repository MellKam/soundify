<div align="center">
  <p align="center">
    <img align="center" width="500px" src="https://user-images.githubusercontent.com/51422045/220605177-226a80c8-9337-4e42-ae40-40787c82a5a9.png">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/soundify-web-api">
      <img alt="npm" src="https://img.shields.io/npm/v/soundify-web-api?color=1DB954">
    </a>
    <a href="https://deno.land/x/soundify">
      <img alt="deno.land" src="https://img.shields.io/github/v/tag/MellKam/soundify?color=1DB954&label=deno.land%2Fx&logo=deno">
    </a>
    <a href="https://github.com/MellKam/soundify/blob/main/LICENSE">
      <img alt="license" src="https://img.shields.io/github/license/MellKam/soundify?color=1DB954">
    </a>
    <a href="https://github.com/MellKam/soundify/commits/main">
      <img src="https://img.shields.io/github/last-commit/MellKam/soundify?color=1DB954" alt="Last commit" />
    </a>
  </p>
</div>

<div align="center">
  <i>Not ready for production</i>
  <strong>
    <h1 align="center">Soundify (ALPHA)</h1>
  </strong>
  <p align="center">
    Soundify is a lightweight and flexible library for seamless communication with Spotify API, designed to work smoothly with TypeScript, Deno, Node.js, and client-side JavaScript. It's open source and provides an easy-to-use interface for accessing Spotify's data.
  </p>
</div>

# What makes this library special?

- Multiplatform: You can use it with Node.js, Deno on the server, or with client-side JavaScript.
- Comprehensive Spotify Auth support: It can handle all Spotify Auth flows and automatically refreshes access tokens.
- Modern: It leverages modern web APIs like native `fetch`, `crypto`, `URLSearchParams` and doesn't require any external dependencies.
- Lightweight and treeshakable: It's designed to be as small as possible (exact size TBD).
- TypeScript first: It's built with TypeScript and provides great support for it out of the box.
- Great docs: The library comes with extensive documentation and lots of examples to help you get started.

# Installation

### NPM [npm.js/soundify-web-api](https://www.npmjs.com/package/soundify-web-api)

```bash
npm i soundify-web-api
```

Unfortunately, the `soundify` package on the NPM was already taken ;(

```ts
// For nodejs (server-side)
import { ... } from "soundify-web-api"

// For client-side javascript
import { ... } from "soundify-web-api/web"
```

### Deno [deno.land/x/soundify](https://deno.land/x/soundify)

```ts
// Import from denoland (recomended)
import { ... } from "https://deno.land/x/soundify/mod.ts"

// Import from github repo main branch 
import { ... } from "https://raw.githubusercontent.com/MellKam/soundify/main/mod.ts";
```

# Gettings started

Let's write "Hello world!" with soundify.

```js
import { getCurrentUserProfile, SpotifyClient } from "soundify-web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const user = await getCurrentUserProfile(client);
console.log(user);
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

## But how to get your Access Token?

If you just want to get a token quickly you can go to the [Spotify Console](https://developer.spotify.com/console/). Then navigate to any endpoint and click on "GET TOKEN". You will be prompted to select scopes and then redirected to authentification. You will then have your token in the "OAuth Token" field.

Or you can try running one of our examples with a simple http server that will give you your token. With node [examples/node-express-auth](https://github.com/MellKam/soundify/tree/main/examples/node-express-auth) or with deno [examples/deno-oak-auth](https://github.com/MellKam/soundify/tree/main/examples/deno-oak-auth)

# Authorization

If you have no experience with Spotify Auth you can read more about it in the [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/). 

## Flows

Authorization flows are organized into separate namespaces, with each namespace containing all the necessary functions and classes to implement a specific authorization flow. This allows for easy importing of a specific flow.

For instance, the following code imports different authorization flows:

```ts
// Importing the Authorization Code flow
import { AuthCode } from "soundify-web-api"

// Importing the Authorization Code flow with PKCE
import { PKCEAuthCode } from "soundify-web-api"

// Importing the Client Credentials flow
import { ClientCredentials } from "soundify-web-api"

// Importing the Implicit Grant flow
import { ImplicitGrant } from "soundify-web-api"
```

You can take a look at the examples to see how to use each authorization flow.

- Authorization Code flow - [examples/node-express-auth](https://github.com/MellKam/soundify/tree/main/examples/node-express-auth), [examples/next-ssr](https://github.com/MellKam/soundify/tree/main/examples/next-ssr), [examples/deno-oak-auth](https://github.com/MellKam/soundify/tree/main/examples/deno-oak-auth)
- Authorization Code flow with PKCE - [examples/react-pkce-auth](https://github.com/MellKam/soundify/tree/main/examples/react-pkce-auth)
- Client Credentials flow - TBD
- Implicit Grant flow - [examples/react-implicit-grant](https://github.com/MellKam/soundify/tree/main/examples/react-implicit-grant)

## AuthProvider

As you saw earlier, you can simply pass the Access Token to SpotifyClient.
But after some time (1 hour to be exact), it will expire and you'll need to deal with it yourself. Somehow get a new Access Token and set it on the client.
```ts
import { SpotifyClient } from "soundify-web-api"

const client = new SpotifyClient("ACCESS_TOKEN")
// ...
// Oops, token expires :(
client.setAuthProvider("NEW_ACCESS_TOKEN")
```

But if you don't want to deal with all that, you can just create an `AuthProvider` and pass it instead of the Access Token.
```ts
import { AuthCode, SpotifyClient } from "soundify-web-api";

const authProvider = new AuthCode.AuthProvider({
  client_id: "YOUR_SPOTIFY_CLIENT_ID",
  client_secret: "YOUR_SPOTIFY_CLIENT_SECRET",
  refresh_token: "YOUR_REFRESH_TOKEN",
});

const client = new SpotifyClient(authProvider);
```

You can create an `AuthProvider` from `AuthCode`, `PKCEAuthCode`, `ClientCredentials` flows. Implicit grant does not allow you to implement such a thing.

## Auth Scopes

You will use auth scopes when creating an authorization url using the `getAuthURL` function. You can pass scopes just as raw strings. It will be easy becase you will have autofill for them :)

```ts
import { AuthCode } from "soundify-web-api";

AuthCode.getAuthURL({
  scopes: ["user-read-email", ...],
  ...
})
```

Or you can use the `AUTH_SCOPES` const object, which is used as an enum
```ts
import { AuthCode, AUTH_SCOPES } from "soundify-web-api";

AuthCode.getAuthURL({
  scopes: [AUTH_SCOPES.USER_READ_EMAIL],
  ...
})
```

If you need to set all scopes, it may be much easier to use `AUTH_SCOPES` and take all values from it.
```ts
import { AuthCode, AUTH_SCOPES } from "soundify-web-api";

AuthCode.getAuthURL({
  scopes: Object.values(AUTH_SCOPES),
  ...
})
```

Be careful with scopes, because many fields and endpoints may not be available because the auth scope is not set.

All contributions are very welcome ❤️



