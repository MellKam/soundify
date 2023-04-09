import {
  AuthCodeCallbackData,
  SpotifyAuthError,
  createAuthProvider,
  getBasicAuthHeader,
  parseCallbackData,
} from "./general";
import { faker } from "@faker-js/faker";
import { vi, it, expect } from "vitest";

it("parseCallbackData with code", () => {
  const callbackData: AuthCodeCallbackData = {
    code: faker.random.alphaNumeric(128),
    state: faker.random.alphaNumeric(64),
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData with error", () => {
  const callbackData: AuthCodeCallbackData = {
    error: faker.lorem.lines(),
    state: faker.random.alphaNumeric(64),
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData without state", () => {
  const callbackData: AuthCodeCallbackData = {
    code: faker.random.alphaNumeric(128),
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData with invalid data", () => {
  expect(() => parseCallbackData(new URLSearchParams())).toThrowError(
    "Invalid params"
  );
});

it("createAuthProvider with default token", async () => {
  const oldToken = faker.random.alphaNumeric(32);
  const mockToken = faker.random.alphaNumeric(32);
  const refresher = vi.fn(() => {
    return Promise.resolve({
      access_token: mockToken,
    });
  });

  const authProvider = createAuthProvider({ refresher, token: oldToken });

  expect(authProvider.token).toBe(oldToken);

  const newToken = await authProvider.refresher();

  expect(refresher).toBeCalledTimes(1);
  expect(newToken).toBe(mockToken);
});

it("createAuthProvider onRefreshSuccess event", async () => {
  const mockToken = faker.random.alphaNumeric(32);
  const refresher = vi.fn(() => {
    return Promise.resolve({
      access_token: mockToken,
    });
  });

  const onRefreshSuccess = vi.fn();

  const authProvider = createAuthProvider({ refresher, onRefreshSuccess });

  await authProvider.refresher();

  expect(onRefreshSuccess).toBeCalledWith({
    access_token: mockToken,
  });
  expect(onRefreshSuccess).toBeCalledTimes(1);
});

it("createAuthProvider onRefreshFailure event", async () => {
  const error = new Error("Invalid token");
  const refresher = vi.fn(() => Promise.reject(error));
  const onRefreshFailure = vi.fn();

  const authProvider = createAuthProvider({ refresher, onRefreshFailure });

  await expect(async () => await authProvider.refresher()).rejects.toThrow(
    error
  );

  expect(onRefreshFailure).toBeCalledWith(error);
  expect(onRefreshFailure).toBeCalledTimes(1);
});

it("getBasicAuthHeader", () => {
  const result = getBasicAuthHeader("123", "456");

  expect(result).toBe("Basic MTIzOjQ1Ng==");
});

it("SpotifyAuthError.create() #1", async () => {
  const error = await SpotifyAuthError.create(
    new Response(
      JSON.stringify({
        error: "invalid_client",
        error_description: "Somehting went wrong",
      })
    )
  );

  expect(error).toBeInstanceOf(SpotifyAuthError);
  expect(error.message).toBe("invalid_client");
  expect(error.status).toBe(200);
  expect(error.description).toBe("Somehting went wrong");
});

it("SpotifyAuthError.create() #2", async () => {
  const error = await SpotifyAuthError.create(
    new Response("Unexpected error", { status: 500 })
  );

  expect(error).toBeInstanceOf(SpotifyAuthError);
  expect(error.message).toBe("Unexpected error");
  expect(error.status).toBe(500);
  expect(error.description).toBeUndefined();
});
