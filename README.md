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
- - Comprehensive Spotify Auth support: It can handle all Spotify Auth flows and automatically refreshes access tokens.
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

First of all, you should already have a Spotify app created. If not, go and create one here https://developer.spotify.com/dashboard

Let's write "Hello world!" with soundify.

```js
import { getCurrentUserProfile, SpotifyClient } from "soundify-web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const user = await getCurrentUserProfile(client);
console.log(user);
```

If access token is valid it will output something like this
```json
{
  "id": "31xofk5q7l22rvsbff7yiechyx6i",
  "display_name": "Soundify",
  "type": "user",
  "uri": "spotify:user:31xofk5q7l22rvsbff7yiechyx6i",
  ...
}
```

## But how to get your Access Token?

If you're new to Spotify, you can read more about it in the [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/). 

Next, you can go to [examples/node-express-auth](https://github.com/MellKam/soundify/tree/main/examples/node-express-auth) or [examples/deno-oak-auth](https://github.com/MellKam/soundify/tree/main/examples/deno-oak-auth) and see the example http server code that will help you get your tokens.


# Authorization

The flows are separated by namespaces. Each namespace has all the necessary functions and classes to implement a given authorization flow.

This is how you can import specific authorization flow. 

```ts
// Authorization code flow
import { AuthCode } from "soundify-web-api"
// Authorization code flow with PKCE
import { PKCEAuthCode } from "soundify-web-api"
// Client credentials flow
import { ClientCredentials } from "soundify-web-api"
// Implicit grant flow
import { ImplicitGrant } from "soundify-web-api"
```

Flows have similar functions and classes. For example `getAuthURL`, `getGrantData` and `AuthProvider`.

## AuthProvider

For authorization, you can simply use an access token and independently set a new access token after its expiration
```ts
import { SpotifyClient } from "soundify-web-api"

const client = new SpotifyClient("ACCESS_TOKEN")
// token expires
client.setAuthProvider("NEW_ACCESS_TOKEN")
```

But if you need automatic refresh, you can create an AuthProvider. 
```ts
// For authorization code flow
const authProvider = new AuthCode.AuthProvider({
  client_id: "SPOTIFY_CLIENT_ID",
  client_secret: "SPOTIFY_CLIENT_SECRET",
  refresh_token: "YOUR_REFRESH_TOKEN",
})

// For authorization code flow with PKCE
const authProvider = new PKCEAuthCode.AuthProvider({
  client_id: "SPOTIFY_CLIENT_ID",
  refresh_token: "YOUR_REFRESH_TOKEN",
})

// For client credentials flow
const authProvider = new ClientCredentials.AuthProvider({
  client_id: "SPOTIFY_CLIENT_ID",
  client_secret: "SPOTIFY_CLIENT_SECRET",
})

const client = new SpotifyClient(authProvider)
```

The Implicit Grant does not have an AuthProvider because it does not have the ability to refresh the token without reloading the page. Therefore, every time a token expires, you must redirect the user to get a new token

## Auth Scopes

Scopes can be setted just as array of string

```ts
import { AuthCode } from "soundify-web-api";

AuthCode.getAuthURL({
  scopes: ["user-read-email"],
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

If you need to set all scopes, it may be much easier to use `AUTH_SCOPES`.
```ts
import { AuthCode, AUTH_SCOPES } from "soundify-web-api";

AuthCode.getAuthURL({
  scopes: Object.values(AUTH_SCOPES),
  ...
})
```

Be careful with scopes, because many fields and endpoints may not be available because the auth scope is not set.

All contributions are very welcome ❤️



