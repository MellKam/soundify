<img style="width: 100%; max-height: 400px; object-fit: contain; border: none; box-sizing: content-box;" src="https://user-images.githubusercontent.com/51422045/216315836-fb8faeed-c9d9-42bb-a8a6-507e0b3a66d1.jpg">

<div align="center">

![DENO](https://shield.deno.dev/x/soundify)
![NPM](https://img.shields.io/npm/v/soundify-web-api?label=npm&logo=npm&labelColor=000000)
![GitHub last commit](https://img.shields.io/github/last-commit/MellKam/soundify-web-api?labelColor=000000)

</div>

# Package status

This package is in active development now. All API may be not stable and this is
not recemended to use in production.

# Installation

## NPM
[soundify on npmjs.com](https://www.npmjs.com/package/soundify-web-api)

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

## Deno 

[soundify on deno.land](https://deno.land/x/soundify)

```ts
// Import from denoland (recomended)
import { ... } from "https://deno.land/x/soundify/mod.ts"

// Import from github repo main branch 
import { ... } from "https://raw.githubusercontent.com/MellKam/soundify/main/mod.ts";
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

> As from spotify docs: "Implicit grant is not recommended because it returns a token in a URL instead of a trusted channel and does not support token updates"; 



