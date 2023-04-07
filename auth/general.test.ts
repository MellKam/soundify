import {
	AuthCodeCallbackData,
	createAuthProvider,
	parseCallbackData,
} from "auth/general.ts";
import {
	assert,
	assertEquals,
	assertThrows,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { faker } from "npm:@faker-js/faker";
import {
	assertSpyCall,
	assertSpyCalls,
	spy,
} from "https://deno.land/std@0.182.0/testing/mock.ts";

Deno.test("parseCallbackData with code", () => {
	const callbackData: AuthCodeCallbackData = {
		code: faker.random.alphaNumeric(128),
		state: faker.random.alphaNumeric(64),
	};

	const result = parseCallbackData(new URLSearchParams(callbackData));

	assertEquals(result, callbackData);
});

Deno.test("parseCallbackData with error", () => {
	const callbackData: AuthCodeCallbackData = {
		error: faker.lorem.lines(),
		state: faker.random.alphaNumeric(64),
	};

	const result = parseCallbackData(new URLSearchParams(callbackData));

	assertEquals(result, callbackData);
});

Deno.test("parseCallbackData without state", () => {
	const callbackData: AuthCodeCallbackData = {
		code: faker.random.alphaNumeric(128),
	};

	const result = parseCallbackData(new URLSearchParams(callbackData));

	assertEquals(result, callbackData);
});

Deno.test("parseCallbackData with invalid data", () => {
	assertThrows(
		() => parseCallbackData(new URLSearchParams()),
		"Invalid params",
	);
});

Deno.test("createAuthProvider with default token", async () => {
	const oldToken = faker.random.alphaNumeric(32);
	const mockToken = faker.random.alphaNumeric(32);
	const refresher = spy(() => {
		return Promise.resolve({
			access_token: mockToken,
		});
	});

	const authProvider = createAuthProvider({ refresher, token: oldToken });

	assert(authProvider.token === oldToken);

	const newToken = await authProvider.refresher();

	assertSpyCalls(refresher, 1);
	assert(newToken === mockToken);
});

Deno.test("createAuthProvider onRefreshSuccess event", async () => {
	const mockToken = faker.random.alphaNumeric(32);
	const refresher = spy(() => {
		return Promise.resolve({
			access_token: mockToken,
		});
	});

	const onRefreshSuccess = spy();

	const authProvider = createAuthProvider({ refresher, onRefreshSuccess });

	await authProvider.refresher();

	assertSpyCall(onRefreshSuccess, 0, {
		args: [{
			access_token: mockToken,
		}],
	});
	assertSpyCalls(onRefreshSuccess, 1);

	await authProvider.refresher();
	assertSpyCalls(onRefreshSuccess, 2);
});

Deno.test("createAuthProvider onRefreshFailure event", async () => {
	const error = new Error("Invalid token");
	const refresher = spy(() => Promise.reject(error));
	const onRefreshFailure = spy();

	const authProvider = createAuthProvider({ refresher, onRefreshFailure });

	try {
		await authProvider.refresher();
	} catch (e) {
		assertEquals(e, error);
	}

	assertSpyCall(onRefreshFailure, 0, { args: [error] });
	assertSpyCalls(onRefreshFailure, 1);

	try {
		await authProvider.refresher();
	} catch (e) {
		assertEquals(e, error);
	}

	assertSpyCall(onRefreshFailure, 1, { args: [error] });
	assertSpyCalls(onRefreshFailure, 2);
});
