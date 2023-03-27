import {
	assert,
	assertInstanceOf,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { getRedirectURL } from "auth/auth_code.ts";

Deno.test("AuthCode: getRedirectURL", () => {
	const expectedURL =
		"https://accounts.spotify.com/authorize?response_type=code&scope=playlist-read-private+user-library-modify&client_id=321&redirect_uri=567&show_dialog=false&state=123";

	const url = getRedirectURL({
		client_id: "321",
		redirect_uri: "567",
		scopes: ["playlist-read-private", "user-library-modify"],
		show_dialog: false,
		state: "123",
	});

	assertInstanceOf(url, URL);
	assert(url.toString() === expectedURL);
});
