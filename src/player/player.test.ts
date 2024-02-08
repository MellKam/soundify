import {
	getAvailableDevices,
	// getCurrentPlayingTrack,s
	getPlaybackState,
} from "./player.endpoints.ts";
import { client } from "../test_client.ts";
import { deviceSchema, playbackStateSchema } from "./player.schemas.ts";
import { z } from "zod";

Deno.test("getPlaybackState", async () => {
	const state = await getPlaybackState(client);
	playbackStateSchema.parse(state);
});

Deno.test("getAvailableDevices", async () => {
	const devices = await getAvailableDevices(client);
	z.array(deviceSchema).parse(devices);
});

// Deno.test("getCurrentPlayingTrack", async () => {
// 	const state = await getCurrentPlayingTrack(client);
// 	playbackStateSchema.parse(state);
// });
