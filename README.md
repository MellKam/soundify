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

```ts
// "/api" - Can be used both in the browser and in nodejs
import { ... } from "@soudnfiy/api"

// "/web-auth" - Authorization for browser
import { ... } from "@soundify/web-auth"

// "/node-auth" - Authorization for nodejs
import { ... } from "@soundify/node-auth"
```

## [Deno](https://deno.land/x/soundify)

```ts
import { ... } from "https://deno.land/x/soundify/mod.ts"
```
