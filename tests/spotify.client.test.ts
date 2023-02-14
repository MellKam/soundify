import { ClientCredentialsService } from "../mod.ts";
import { getTestEnv } from "./testEnv.ts";

import { assertRejects } from "https://deno.land/std@0.177.0/testing/asserts.ts";

const env = getTestEnv();

Deno.test("SpotifyClient #1: must retry five times with interval 500ms", async () => {
	const spotifyClient = new ClientCredentialsService({
		SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
	}).createClient();

	await assertRejects(async () => {
		let time = 1;

		await spotifyClient.retryOrThrow(
			() => {
				console.log(`Retry ${time} time`);
				time++;
				return new Response(JSON.stringify({ data: 5 }), { status: 400 });
			},
			new Error("Expected error"),
			{
				times: 5,
				interval: 100,
				handler: (res, retryOrThrow) => {
					const status = res.status;

					if (status === 400) {
						retryOrThrow(new Error("400 error"));
					}
				},
			},
		);
	});

	spotifyClient.removeExpireListener();
});
