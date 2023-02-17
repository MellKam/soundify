<img style="width: 100%; max-height: 400px; object-fit: contain; border: none; box-sizing: content-box;" src="https://user-images.githubusercontent.com/51422045/216315836-fb8faeed-c9d9-42bb-a8a6-507e0b3a66d1.jpg">

<div align="center">

![DENO](https://shield.deno.dev/x/soundify)
![NPM](https://img.shields.io/npm/v/soundify-web-api?label=npm&logo=npm&labelColor=000000)
![GitHub last commit](https://img.shields.io/github/last-commit/MellKam/soundify-web-api?labelColor=000000)

</div>

# Package status

This package is in active development now. All API may be not stable and this is
not recemended to use in production.

# NPM

Lint to package - [soundify-web-api](https://www.npmjs.com/package/soundify-web-api)

```bash
npm i soundify-web-api
```

```ts
// For nodejs
import { ... } from "soundify-web-api"

// For client-side javascript
import { ... } from "soundify-web-api/web"
```

# Deno 

Link to package - [soundify](https://deno.land/x/soundify)

```ts
import { ... } from "https://deno.land/x/soundify/mod.ts"
```

# Authorization flow

There are 4 flows for authorization. It may be difficult for beginners to choose one of them. In this case, you can check out Spotify's official documentation on this.
[How to chose authorization flow?](https://developer.spotify.com/documentation/general/guides/authorization/#which-oauth-flow-should-i-use)

#### This is a copy of the summary table for all auth flows

| Flow | Access user resources | Requires secret key (SERVER-SIDE) | Access token refresh |
| :---: | :---: | :---: | :---: |
| Authorization code | Yes | Yes | Yes |
| Authorization code with PKCE | Yes | No | Yes |
| Client credentials | No | Yes | No |
| Implicit grant | Yes | No | No |



