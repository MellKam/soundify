<div align="center">
  <p align="center">
     <img align="center" width="480px" src="https://svgshare.com/i/rf9.svg">
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@soundify/web-api">
      <img alt="npm" src="https://img.shields.io/npm/v/@soundify/web-api">
    </a>
		<a href="https://bundlejs.com/?q=%40soundify%2Fweb-api&treeshake=%5B*%5D">
			<img src="https://deno.bundlejs.com/?q=@soundify/web-api&badge=minified" alt="Size of package (minified)" />
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
 <a href="#getting-started">Getting Started</a> | <a href="#error-handling-📛">Error handling</a> | <a href="#token-refreshing">Token refreshing</a> | <a href="#pagination">Pagination</a>
</p>

## Installation

The package doesn't depend on runtime specific apis, so you should be able to
use it without any problems everywhere.

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

Soundify has a very simple structure. It consists of a `SpotifyClient` capable
of making requests to the Spotify API, along with a set of functions (like
`getCurrentUser`) that utilize the client to make requests to specific
endpoints.

```ts
import { getCurrentUser, search, SpotifyClient } from "@soundify/web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const me = await getCurrentUser(client);
console.log(me);

const result = await search(client, "track", "Never Gonna Give You Up");
console.log(result.tracks.items.at(0));
```

Compared to the usual OOP way of creating API clients, this approach has several
advantages. The main one is that it is _tree-shakable_. You only ship code you
use. This may be not that important for server-side apps, but I'm sure frontend
users will thank you for not including an extra 10kb of crappy js into your
bundle.

```ts
import {
	getAlbumTracks,
	getArtist,
	getArtistAlbums,
	getRecommendations,
	SpotifyClient,
} from "@soundify/web-api";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const radiohead = await getArtist(client, "4Z8W4fKeB5YxbusRsdQVPb");
console.log(`Radiohead popularity - ${radiohead.popularity}`);

const pagingResult = await getArtistAlbums(client, radiohead.id, { limit: 1 });
const album = pagingResult.items.at(0)!;
console.log(`Album - ${album.name}`);

const tracks = await getAlbumTracks(client, album.id, { limit: 5 });
console.table(
	tracks.items.map((track) => ({
		name: track.name,
		duration: track.duration_ms,
	})),
);

const recomendations = await getRecommendations(client, {
	seed_artists: [radiohead.id],
	seed_tracks: tracks.items.map((track) => track.id).slice(0, 4),
	market: "US",
	limit: 5,
});
console.table(
	recomendations.tracks.map((track) => ({
		artist: track.artists.at(0)!.name,
		name: track.name,
	})),
);
```

## Error handling 📛

```ts
import { getCurrentUser, SpotifyClient, SpotifyError } from "@soundify/web-api";

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

If you're really annoying customer, Spotify may block you for some time. To know
what time you need to wait, you can use `Retry-After` header, which will tell
you time in seconds.
[More about rate limiting↗](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

To handle this automatically, you can use `waitForRateLimit` option in
`SpotifyClient`. (it's disabled by default, because it may block your code for
unknown time)

```ts
const client = new SpotifyClient("YOUR_ACCESS_TOKEN", {
	waitForRateLimit: true,
	// wait only if it's less than a minute
	waitForRateLimit: (retryAfter) => retryAfter < 60,
});
```

## Authorization

Soundify doesn't provide any tools for authorization, because that would require
to write whole oauth library in here. We have many other battle-tested oauth
solutions, like [oauth4webapi](https://github.com/panva/oauth4webapi) or
[oidc-client-ts](https://github.com/authts/oidc-client-ts). I just don't see a
point in reinventing the wheel 🫤.

Despite this, we have a huge directory of examples, including those for
authorization.
[OAuth2 Examples↗](https://github.com/MellKam/soundify/tree/main/examples/oauth)

### Token Refreshing

```ts
import { getCurrentUser, SpotifyClient } from "@soundify/web-api";

// if you don't have access token yet, you can pass null to first argument
const client = new SpotifyClient(null, {
	// but you have to provide a function that will return a new access token
	refresher: () => {
		return Promise.resolve("YOUR_NEW_ACCESS_TOKEN");
	},
});

const me = await getCurrentUser(client);
// client will call your refresher to get the token
// and only then make the request
console.log(me);

// let's wait some time to expire the token ...

const me = await getCurrentUser(client);
// client will receive 401 and call your refresher to get new token
// you don't have to worry about it as long as your refresher is working
console.log(me);
```

## Pagination

To simplify the process of paginating through the results, we provide a
`PageIterator` and `CursorPageIterator` classes.

```ts
import { getPlaylistTracks, SpotifyClient } from "@soundify/web-api";
import { PageIterator } from "@soundify/web-api/pagination";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

const playlistIter = new PageIterator(
	(offset) =>
		getPlaylistTracks(client, "37i9dQZEVXbMDoHDwVN2tF", {
			// you can find the max limit for specific endpoint
			// in spotify docs or in the jsdoc comments of this property
			limit: 50,
			offset,
		}),
);

// iterate over all tracks in the playlist
for await (const track of playlistIter) {
	console.log(track);
}

// or collect all tracks into an array
const allTracks = await playlistIter.collect();
console.log(allTracks.length);

// Want to get the last 100 items? No problem
const lastHundredTracks = new PageIterator(
	(offset) =>
		getPlaylistTracks(
			client,
			"37i9dQZEVXbMDoHDwVN2tF",
			{ limit: 50, offset },
		),
	{ initialOffset: -100 }, // this will work just as `Array.slice(-100)`
).collect();
```

```ts
import { getFollowedArtists, SpotifyClient } from "@soundify/web-api";
import { CursorPageIterator } from "@soundify/web-api/pagination";

const client = new SpotifyClient("YOUR_ACCESS_TOKEN");

// loop over all followed artists
for await (
	const artist of new CursorPageIterator(
		(opts) => getFollowedArtists(client, { limit: 50, after: opts.after }),
	)
) {
	console.log(artist.name);
}

// or collect all followed artists into an array
const artists = await new CursorPageIterator(
	(opts) => getFollowedArtists(client, { limit: 50, after: opts.after }),
).collect();

// get all followed artists starting from Radiohead
const artists = await new CursorPageIterator(
	(opts) => getFollowedArtists(client, { limit: 50, after: opts.after }),
	{ initialAfter: "4Z8W4fKeB5YxbusRsdQVPb" }, // let's start from Radiohead
).collect();
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
});
```

## Contributors ✨

All contributions are very welcome ❤️
([emoji key](https://allcontributors.org/docs/en/emoji-key))

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://t.me/mellkam"><img src="https://avatars.githubusercontent.com/u/51422045?v=4?s=100" width="100px;" alt="Artem Melnyk"/><br /><sub><b>Artem Melnyk</b></sub></a><br /><a href="#maintenance-MellKam" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/danilluk1"><img src="https://avatars.githubusercontent.com/u/51733612?v=4?s=100" width="100px;" alt="danluki"/><br /><sub><b>danluki</b></sub></a><br /><a href="https://github.com/MellKam/soundify/commits?author=danilluk1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://lwjerri.dev"><img src="https://avatars.githubusercontent.com/u/50290430?v=4?s=100" width="100px;" alt="Andrii Zontov"/><br /><sub><b>Andrii Zontov</b></sub></a><br /><a href="https://github.com/MellKam/soundify/issues?q=author%3ALWJerri" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
