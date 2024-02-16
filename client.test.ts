import { SpotifyClient, SpotifyError } from "./client.ts";
import { sandbox } from "mock_fetch";
import { assert, assertEquals, assertInstanceOf } from "std/assert/mod.ts";

Deno.test("SpotifyClient: basic", async () => {
	const { mock, fetch } = sandbox();

	mock("GET@/v1/me", (req) => {
		assert(req.url === "https://api.spotify.com/v1/me");
		assert(req.headers.get("Accept") === "application/json");
		assert(req.headers.get("Authorization") === "Bearer TOKEN");
		return Response.json({ id: "123" });
	});

	const client = new SpotifyClient("TOKEN", { fetch });
	const res = await client.fetch("/v1/me");
	assert(res.status === 200);
	assertEquals(await res.json(), { id: "123" });
});

Deno.test("SpotifyClient: error handling", async () => {
	const { mock, fetch } = sandbox();
	const playlistId = crypto.randomUUID();

	mock("PUT@/v1/playlists/:playlistId/followers", () => {
		return Response.json(
			{ error: { status: 400, message: "Invalid request" } },
			{ status: 400, statusText: "Bad Request" }
		);
	});

	const client = new SpotifyClient("TOKEN", { fetch });

	try {
		await client.fetch(`/v1/playlists/${playlistId}/followers`, {
			method: "PUT",
		});
		assert(false, "should throw an error");
	} catch (error) {
		assertInstanceOf(error, SpotifyError);
		assert(error.message === "400 Bad Request : Invalid request");
		assertEquals(error.body, {
			error: { status: 400, message: "Invalid request" },
		});
	}
});
