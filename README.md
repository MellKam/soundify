<div align="center">
  <p align="center">
     <img align="center" width="480px" src="https://svgshare.com/i/rf9.svg">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@soundify/web-api">
      <img alt="npm" src="https://img.shields.io/npm/v/@soundify/web-api?color=509BF5">
    </a>
    <a href="https://www.npmjs.com/package/@soundify/web-api">
      <img src="https://img.shields.io/npm/dw/%40soundify%2Fweb-api?color=509BF5" alt="NPM downloads" />
    </a>
    <a href="https://github.com/mellkam/soundify">
      <img src="https://img.shields.io/github/stars/mellkam/soundify" alt="Github stars" />
    </a>
  </p>
</div>

<div align="center">
  <p align="center">
    Soundify is a lightweight and flexible library for interacting with the Spotify API, designed to work seamlessly with TypeScript and support all available runtimes.
  </p>
</div>

<p align="center">
 <a href="https://radix-vue.com">Getting Started</a> | <a href="https://www.radix-vue.com/overview/getting-started.html">Authorization</a> | <a href="https://www.radix-vue.com/">Usage</a> | <a href="#contributors-✨">Contributors</a>
</p>

## Installation

The package doesn't depend on runtime specific apis, so you should be able to use it without any problems everywhere.  

```bash
pnpm add @soundify/web-api
```
```bash
bun install @soundify/web-api
```
```jsonc
// deno.json
{
  "imports": {
    "@soundify/web-api": "https://deno.land/x/soundify/mod.ts"
  }
}
```

## Getting Started

Soundify has a very simple structure. It consists of a `SpotifyClient` capable of making requests to the Spotify API, along with a set of functions (like `getCurrentUser`) that utilize the client to make requests to specific endpoints.

```ts
import { SpotifyClient, getCurrentUser, search } from "@soundify/web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const me = await getCurrentUser(client);
console.log(me);

const result = await search(client, "Never Gonna Give You Up", "track");
console.log(result.tracks.items.at(0));
```

Compared to the usual OOP way of creating API clients, this approach has several advantages. The main one is that it is *tree-shakable*. You only ship code you use. This may be not that important for server-side apps, but I'm sure frontend users will thank you for not including an extra 10kb of crappy js into your bundle.

### Error handling 📛

```ts
import { SpotifyClient, getCurrentUser, SpotifyError } from "@soundify/web-api";

const client = new SpotifyClient("INVALID_ACCESS_TOKEN");

try {
	const me = await getCurrentUser(client);
	console.log(me);
} catch (error) {
	if (error instanceof SpotifyError) {
		error.status; // 401

		const message = typeof error.body === "string"
			? error.body
			: error.body?.error.message;
		console.error(message); // "Invalid access token"

		error.response.headers.get("Date"); // You can access the response here

    console.error(error);
	  // SpotifyError: 401 Unauthorized (https://api.spotify.com/v1/me) : Invalid access token
    return;
	}

  // If it's not a SpotifyError, then it's some type of network error that fetch throws
  // Or can be DOMException if you abort the request
  console.error("We're totally f#%ked!");
}
```

### Rate Limiting 🕒

If you're really annoying customer, Spotify may block you for some time. To know what time you need to wait, you can use `Retry-After` header, which will tell you time in seconds. [More about rate limiting↗](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

To handle this automatically, you can use `waitForRateLimit` option in `SpotifyClient`. (it's disabled by default, because it may block your code for unknown time)

```ts
const client = new SpotifyClient("YOUR_ACCESS_TOKEN", {
  waitForRateLimit: true,
  // wait only if it's less than a minute
  waitForRateLimit: (retryAfter) => retryAfter < 60, 
})
```

### Pagination 

To simplify the process of paginating through the results, we provide a `PageIterator` class. 

```ts
import { SpotifyClient, getPlaylistTracks } from "@soundify/web-api";
import { PageIterator } from "@soundify/web-api/pagination";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN", {
	waitForRateLimit: true,
});

const playlistIter = new PageIterator(
	(opts) => getPlaylistTracks(client, "37i9dQZEVXbMDoHDwVN2tF", opts),
);

// iterate over all tracks in the playlist
for await (const track of playlistIter) {
	console.log(track);
}

// or collect all tracks into an array
const allTracks = await playlistIter.collect();
console.log(allTracks.length);
```

## Authorization

Soundify doesn't provide any tools for authorization, because that would require to write whole oauth library in here. We have many other battle-tested oauth solutions, like [oauth4webapi](https://github.com/panva/oauth4webapi) or [oidc-client-ts](https://github.com/authts/oidc-client-ts). I just don't see a point in reinventing the wheel 🫤.

Despite this, we have a huge directory of examples, including those for authorization. [OAuth2 Examples↗](https://github.com/MellKam/soundify/tree/main/examples/oauth)

### Token Refreshing

```ts
import { SpotifyClient, getCurrentUser } from "@soundify/web-api";

const refresher = () => {
  // This function should return a new access token
  // You can use any library you want to refresh the token
  // Or even make it yourself, we don't care
  return "YOUR_NEW_ACCESS";
}

const accessToken = await refresher();
const client = new SpotifyClient(accessToken, { refresher });

const me = await getCurrentUser(client);
console.log(me);
	
// wait some time to expire the token ...
// 2000 YEARS LATER 🧽

const me = await getCurrentUser(client);
// client will receive 401 and call your refresher to get new token
// you don't have to worry about it as long as your refresher is working
console.log(me);
```

## Other customizations

```ts
import { SpotifyClient } from "@soundify/web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN", {
  // You can use any fetch implementation you want
  // For example, you can use `node-fetch` in node.js
  fetch: (input, init) => {
    return fetch(input, init);
  },
  // You can change the base url of the client
  // by default it's "https://api.spotify.com/"
  beseUrl: "https://example.com/",
  middlewares: [(next) => (url, opts) => {
    // You can add your own middleware
    // For example, you can add some headers to every request
    return next(url, opts);
  }],
})
```

## Contributors ✨

All contributions are very welcome ❤️ ([emoji key](https://allcontributors.org/docs/en/emoji-key))

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="left" width="14.28%"><a href="http://t.me/mellkam"><img src="https://avatars.githubusercontent.com/u/51422045?v=4?s=100" width="100px;" alt="Artem Melnyk"/><br /><sub><b>Artem Melnyk</b></sub></a><br /><a href="#maintenance-MellKam" title="Maintenance">🚧</a></td>
      <td align="center" valign="left" width="14.28%"><a href="https://github.com/danilluk1"><img src="https://avatars.githubusercontent.com/u/51733612?v=4?s=100" width="100px;" alt="danluki"/><br /><sub><b>danluki</b></sub></a><br /><a href="https://github.com/MellKam/soundify/commits?author=danilluk1" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
