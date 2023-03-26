<div align="center">
  <p align="center">
    <img align="center" width="500px" src="https://user-images.githubusercontent.com/51422045/224954318-f4f1290b-7185-4f26-b52b-472fb4f69f45.png">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@soundify/api">
      <img alt="npm" src="https://img.shields.io/npm/v/@soundify/api?color=1DB954">
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
    <a href="https://github.com/MellKam/soundify/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/MellKam/soundify/ci.yaml?color=1DB954&label=CI&logo=github" alt="GitHub CI Status" />
    </a>
  </p>
</div>

<div align="center">
  <i>⚠️ Not ready for production</i>
  <strong>
    <h1 align="center">Soundify</h1>
  </strong>
  <p align="center">
    Soundify is a lightweight and flexible library for seamless communication with Spotify API, designed to work smoothly with TypeScript, Deno, Node.js, and client-side JavaScript. It's open source and provides an easy-to-use interface for accessing Spotify's data.
  </p>
</div>

# Features ✨

- 💻 Multiruntime: supports Node, Deno and Browser environment.
- 🚀 Modern: It leverages modern web APIs like native `fetch`, `crypto`,
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

Soundify is split into subpackages:

- `/auth` - Handles Spotify authorization
- `/api` - Provides client, endpoints and entity types
- `/shared` - General functions and types (used under the hood in `/auth` and
  `/api`)

> This separation is designed to enable the use of specific package on specific
> platforms. For example, `@soundify/web-auth` is suitable for browser, while
> `@soundify/node-auth` is appropriate for nodejs. The only difference in these
> packages is that under the hood they use different platform api to perform the
> same tasks.

## [NPM](https://www.npmjs.com/org/soundify)

```bash
npm i @soundify/api
```

```ts
// "/api" - Can be used both in the browser and in nodejs
import { ... } from "@soudnfiy/api"

// "/web-auth" - Authorization for browser
import { ... } from "@soundify/web-auth"

// "/node-auth" - Authorization for nodejs
import { ... } from "@soundify/node-auth"
```

This is minified bundle size of each package without treeshaking

<p>
  <a href="https://bundlejs.com/?q=%40soundify%2Fapi">
    <img src="https://img.shields.io/badge/dynamic/json?color=1DB954&label=%40soundify%2Fapi&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fapi" alt="@soundify/api">
  </a>
  <a href="https://bundlejs.com/?q=%40soundify%2Fnode-auth">
    <img src="https://img.shields.io/badge/dynamic/json?color=1DB954&label=%40soundify%2Fnode-auth&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fnode-auth" alt="soundify/node-auth">
  </a>
  <a href="https://bundlejs.com/?q=%40soundify%2Fweb-auth">
    <img src="https://img.shields.io/badge/dynamic/json?color=1DB954&label=%40soundify%2Fweb-auth&query=$.size.uncompressedSize&url=https://deno.bundlejs.com/?q=%40soundify%2Fweb-auth" alt="soundify/web-auth">
  </a>
</p>

## [Deno](https://deno.land/x/soundify)

```ts
import { ... } from "https://deno.land/x/soundify/mod.ts"
```

# Gettings started

To get started, you need to create a SpotifyClient, the purpose of which is to create an http request to spotify. It takes an access token as the first parameter. We'll tell you how to get your token later.

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

If you are writing a backend or don't care about the size of the library you can use the `createSpotifyAPI()` function which will bind all the endpoint functions to your client. That way you can use this object throughout your application and not have to worry about imports.

```ts
import { SpotifyClient, createSpotifyAPI } from "@soundify/api";

const api = createSpotifyAPI(new SpotifyClient("ACCESS_TOKEN"));
const user = await api.getCurrentUser();

console.log(user);
```

# Authorization


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

const client = new SpotifyClient("ACCESS_TOKEN");
// ...
// Oops, token expires :(

const { access_token } = await AuthCode.refresh({ 
  client_id: "YOUR_CLIENT_ID", 
  client_secret: "YOUR_CLIENT_SECRET", 
  refresh_token: "YOUR_REFRESH_TOKEN" 
});
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
  access_token: "YOUR_ACCESS_TOKEN",
});

const client = new SpotifyClient(authProvider);
```

Note that to create an `AuthProvider` you must pass an access token to its constructor. For example, if you will store a user refresh token in the database and want to use it, you will have to refresh the token first. There are shortcuts to do this:

```ts
import { SpotifyClient } from "@soundify/api";
import { AuthCode } from "@soundify/node-auth";

const authProvider = await AuthCode.AuthProvider.create({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  refresh_token: "YOUR_REFRESH_TOKEN",
  // no need to provide access token
});

const client = new SpotifyClient(authProvider);
```

`.create` - is a static method that will automatically refresh the token and create the AuthProvider for you.

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
