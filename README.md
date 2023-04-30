<div align="center">
  <p align="center">
     <img align="center" width="480px" src="https://svgshare.com/i/rf9.svg">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@soundify/web-api">
      <img alt="npm" src="https://img.shields.io/npm/v/@soundify/web-api?color=509BF5">
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
    <a href="https://codecov.io/gh/MellKam/soundify">
      <img src="https://img.shields.io/codecov/c/gh/MellKam/soundify?color=509BF5&label=coverage" alt="Code test coverage" />
    </a>
  </p>
</div>

<div align="center">
  <p align="center">
    Soundify is a lightweight and flexible library for seamless communication with Spotify API, designed to work smoothly with TypeScript, Deno, Node.js, and client-side JavaScript. It's open source and provides an easy-to-use interface for accessing Spotify's data.
  </p>
</div>

# Features ✨

- 💻 Multiruntime: Works seamlessly with Node.js, Deno, and the Browser
  environment.
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

## [NPM](https://www.npmjs.com/org/soundify/web-api)

```bash
npm i @soundify/web-api
```

# Gettings started

To make your first request with Soundify you need to create a `SpotifyClient`.
As the first parameter it takes access token or
[AuthProvider](#auth-provider-and-automatic-tokens-refreshing).

```ts
import { SpotifyClient } from "@soundify/web-api";

const client = new SpotifyClient("ACCESS_TOKEN");
```

If you've used other api libraries, you can expect something like a bunch of
methods on a single class, but in our case the default recommendation is to use
endpoint functions that take the client as the first argument. In practice, it
looks like this:

```ts
import { getCurrentUser, SpotifyClient } from "@soundify/web-api";

const client = new SpotifyClient("ACCESS_TOKEN");
const user = await getCurrentUser(client);

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

This may be inconvenient for some users, but it was done primarily to allow tree
sharding so that clients don't send a lot of unused code.

But, if you are writing a backend or don't care about the size of the library
you can use the `createSpotifyAPI()` function which will bind all the endpoint
functions to the client. That way you can use this object throughout your
application and not have to worry about imports.

```ts
import { createSpotifyAPI, SpotifyClient } from "@soundify/web-api";

const api = createSpotifyAPI("ACCESS_TOKEN");
const user = await api.getCurrentUser();

console.log(user);
```

# Authorization

If you have no experience with Spotify Authorization you can read more about it
in the
[Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization).

There are four authorization flows that can be used in Spotify, and all of them
are supported in this library 🔥. The criteria for choosing the right flow for
you are described in the Spotify docs linked above.

<details>
<summary><h2>Authorization Code flow</h2></summary>

With this flow user grants permission only once, after which you can use refresh
token to create a new access token. The flow is used on the server because it
requires SPOTIFY_CLIENT_SECRET, which is not desirable to show to others.

_Pseudo http-server code just for example_

```ts
import { AuthCode } from "@soundify/web-api";

const authFlow = new AuthCode({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET"
});

const loginHandler = async (req, res) => {
  const authURL = authFlow.getAuthURL({
    redirect_uri: "YOUR_REDIRECT_URI",
    scopes: ["user-read-email"]
  });
  res.redirect(302, authURL.toString());
};

const codeHandler = async (req, res) => {
  try {
    const code = new URL(req.url).searchParams.get("code");
    if (!code) throw new Error("Unable to find 'code'");

    const { access_token, refresh_token } = await authFlow.getGrantData(
      "YOUR_REDIRECT_URI",
      code
    );
    res.cookie("refresh_token", refresh_token);
    res.status(200).json({ access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const refreshHandler = async (req, res) => {
  try {
    const { refresh_token } = req.cookies;
    const { access_token } = await authFlow.refresh(refresh_token);
    res.status(200).json({ access_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

> It is also recommended to use `state`, which provides protection against
> attacks such as cross-site request forgery, but in the examples below we will
> not use it for simplicity.

Real code examples with AuthCode flow:

- [examples/node-express-auth](https://github.com/MellKam/soundify/tree/main/examples/node-express-auth),
- [examples/next-ssr](https://github.com/MellKam/soundify/tree/main/examples/next-ssr),
- [examples/deno-oak-auth](https://github.com/MellKam/soundify/tree/main/examples/deno-oak-auth)

</details>

<details>
<summary><h2>Authorization Code flow with PKCE</h2></summary>

This thread is similar to AuthCode, but it is handled on the client and
therefore does not require SPOTIFY_CLIENT_SECRET.

```ts
import { PKCEAuthCode } from "@soundify/web-api";

const authFlow = new PKCEAuthCode("YOUR_CLIENT_ID");

const authorize = async () => {
  const { code_challenge, code_verifier } = await PKCEAuthCode.generateCodes();
  localStorage.setItem("code_verifier", code_verifier);

  location.replace(
    authFlow.getAuthURL({
      code_challenge,
      scopes: ["user-read-email"],
      redirect_uri: "YOUR_REDIRECT_URI"
    })
  );
};

const codeHandler = async () => {
  const data = PKCEAuthCode.parseCallbackData(
    new URLSearchParams(location.search)
  );

  if ("error" in data) {
    throw new Error(data.error);
  }

  const code_verifier = localStorage.getItem("code_verifier");
  if (!code_verifier) {
    throw new Error("Cannot find code_verifier");
  }

  const { refresh_token, access_token } = authFlow.getGrantData({
    code: data.code,
    code_verifier,
    redirect_uri: "YOUR_REDIRECT_URI"
  });

  localStorage.removeItem("code_verifier");
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("access_token", access_token);
};

const refreshHandler = () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const { access_token, refresh_token } = authFlow.refresh(refreshToken);

  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("access_token", access_token);
};
```

Real code examples with PKCEAuthCode flow:

- [examples/react-pkce-auth](https://github.com/MellKam/soundify/tree/main/examples/react-pkce-auth)

</details>

<details>
<summary><h2>Client Credentials flow</h2></summary>

This flow is used in server-to-server authentication. Since this flow does not
include authorization, only endpoints that do not access user information can be
accessed.

```ts
import { ClientCredentials } from "@soundify/web-api";

const authFlow = new ClientCredentials({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET"
});

const { access_token } = await authFlow.getAccessToken();
```

Real code examples with ClientCredentials flow:

- [examples/deno-client-credentials](https://github.com/MellKam/soundify/tree/main/examples/deno-client-credentials)

</details>

<details>
<summary><h2>Implicit Grant flow</h2></summary>

The implicit grant flow is carried out on the client side and it does not
involve secret keys. Access tokens issued are short-lived with no refresh token
to extend them when they expire.

> As from Spotify docs: "The implicit grant flow has some important security
> flaws, thus **we don't recommend using this flow**. If you need to implement
> authorization where storing your client secret is not possible, use
> Authorization code with PKCE instead."

```ts
import { ImplicitGrant } from "@soundify/web-api";

const authFlow = new ImplicitGrant("YOUR_CLIENT_ID");

const authorize = () => {
  const state = crypto.randomUUID();
  localStorage.setItem("state", state);

  location.replace(
    authFlow.getAuthURL({
      scopes: ["user-read-email"],
      state,
      redirect_uri: "YOUR_REDIRECT_URI"
    })
  );
};

const handleCallback = () => {
  const data = ImplicitGrant.parseCallbackData(location.hash);
  if ("error" in data) {
    throw new Error(data.error);
  }

  const storedState = localStorage.getItem("state");
  if (!storedState || !params.state || storedState !== params.state) {
    throw new Error("Invalid state");
  }

  localStorage.removeItem("state");
  localStorage.setItem("access_token", data.access_token);
};
```

Real code examples with ImplicitGrant flow:

- [examples/react-implicit-grant](https://github.com/MellKam/soundify/tree/main/examples/react-implicit-grant)

</details>

## Auth provider and automatic tokens refreshing

As you saw earlier, you can simply pass the Access Token to SpotifyClient. But
after some time (1 hour to be exact), it will expire and you'll need to deal
with it yourself. Somehow get a new Access Token and set it on the client.

```ts
import { SpotifyClient, AuthCode } from "@soundify/web-api";

const authFlow = new AuthCode({ ... });
const client = new SpotifyClient("ACCESS_TOKEN");
// ...
// Oops, token expires :(

const { access_token } = await authFlow.refresh("REFRESH_TOKEN");
// set new token to your client
client.setAuthProvider(access_token);
```

But if you don't want to deal with all that, you can just create an
`AuthProvider` and pass it instead of the Access Token. It will automatically
refresh your token.

```ts
import { SpotifyClient, AuthCode } from "@soundify/web-api";

const authFlow = new AuthCode({ ... });
const authProvider = authFlow.createAuthProvider("YOUR_REFRESH_TOKEN");

const client = new SpotifyClient(authProvider);
```

You can create an `AuthProvider` from `AuthCode`, `PKCEAuthCode`,
`ClientCredentials` flows. Implicit grant does not allow to implement such
because you have to refresh the page to get a new token.

Also you can create your own AuthProvider from `AuthProvider` class.

```ts
import { AuthProvider } from "@soundify/web-api";

const authProvider = new AuthProvider({
  refresher: async () => {
    // somehow refresh and get new `access_token`
    return { access_token };
  }
});

const client = new SpotifyClient(authProvider);
```

### Refresh Events

AuthProvider provides an additional option for callback events that may be
usefull in some cases.

```ts
import { AuthProvider } from "@soundify/web-api";

const authProvider = new AuthProvider({
  refresher: async () => {
    // ...
  },
  onRefreshSuccess: ({ access_token }) => {
    // do something with new token
    // for example, store it in localStorage
    localStorage.setItem("access_token", access_token);
  },
  onRefreshFailure: (error) => {
    // do something with error
    // for example, ask user to login again
    location.replace(PKCEAuthCode.getAuthURL({ ... }));
  },
});
```

## Auth Scopes

Scopes are usually used when creating authorization url. Pay attention to them,
because many fields and endpoints may not be available if the correct scopes are
not specified. Read the
[Spotify guide](https://developer.spotify.com/documentation/general/guides/authorization/scopes/)
to learn more.

In Soundify scopes can be used as strings or with const object `SCOPES`.

```ts
import { SCOPES, AuthCode } from "@soundify/web-api";

AuthCode.getAuthURL({
  scopes: ["user-read-email"],
  // or like this
  scopes: [SCOPES.USER_READ_EMAIL]
  // or use all scopes
  scopes: Object.values(SCOPES),
})
```

## Contributors ✨

All contributions are very welcome ❤️ ([emoji key](https://allcontributors.org/docs/en/emoji-key))

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
