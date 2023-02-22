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
- Modern: It leverages modern web APIs like native `fetch`, `crypto`, `URLSearchParams` and doesn't require any external dependencies.
- Lightweight and treeshakable: It's designed to be as small as possible (exact size TBD).
- TypeScript first: It's built with TypeScript and provides great support for it out of the box.
- Comprehensive Spotify Auth support: It can handle all Spotify Auth flows and automatically refreshes access tokens.
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

```ts
import { SpotifyClient, getCurrentUserProfile } from "soundify-web-api";

const client = new SpotifyClient(
  authProvider: "YOUR_ACCESS_TOKEN",
)

const user = await getCurrentUserProfile(client);
console.log(user);
```

# Authorization flow

There are 4 authorization flows, and this package supports all of them It may be difficult for beginners to choose one. In this case, you can read Spotify's official documentation on the subject.
[How to chose authorization flow?](https://developer.spotify.com/documentation/general/guides/authorization/#which-oauth-flow-should-i-use)

#### This is a copy of the summary table for all auth flows

| Flow | Access user resources | Requires secret key (SERVER-SIDE) | Access token refresh |
| :---: | :---: | :---: | :---: |
| Authorization code | Yes | Yes | Yes |
| Authorization code with PKCE | Yes | No | Yes |
| Client credentials | No | Yes | No |
| Implicit grant | Yes | No | No |

<br/>

> As from spotify docs: "Implicit grant is not recommended because it returns a token in a URL instead of a trusted channel"

<br/>

Thatnk's ChatGPT for helping to create this readme ❤️



