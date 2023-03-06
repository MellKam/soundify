import { UserPrivate } from "../../mod.ts";

export const privateUserStub: UserPrivate = {
	country: "PL",
	display_name: "Soundify",
	email: "test@soundify.com",
	explicit_content: { filter_enabled: false, filter_locked: false },
	external_urls: {
		spotify: "https://open.spotify.com/user/31xofk5q7l22rvsbff7yiechyx6i",
	},
	followers: { href: null, total: 5 },
	href: "https://api.spotify.com/v1/users/31xofk5q7l22rvsbff7yiechyx6i",
	id: "31xofk5q7l22rvsbff7yiechyx6i",
	images: [
		{
			height: null,
			url: "https://i.scdn.co/image/ab6775700000ee858207453d076380119570a0ac",
			width: null,
		},
	],
	product: "free",
	type: "user",
	uri: "spotify:user:31xofk5q7l22rvsbff7yiechyx6i",
};
