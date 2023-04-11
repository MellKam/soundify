import {
  AuthCodeCallbackData,
  AuthError,
  getBasicAuthHeader,
  parseCallbackData
} from "./general";
import { faker } from "@faker-js/faker";
import { vi, it, expect } from "vitest";

it("parseCallbackData with code", () => {
  const callbackData: AuthCodeCallbackData = {
    code: faker.random.alphaNumeric(128),
    state: faker.random.alphaNumeric(64)
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData with error", () => {
  const callbackData: AuthCodeCallbackData = {
    error: faker.lorem.lines(),
    state: faker.random.alphaNumeric(64)
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData without state", () => {
  const callbackData: AuthCodeCallbackData = {
    code: faker.random.alphaNumeric(128)
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData with invalid data", () => {
  expect(() => parseCallbackData(new URLSearchParams())).toThrowError(
    "Invalid params"
  );
});

it("getBasicAuthHeader", () => {
  const result = getBasicAuthHeader("123", "456");

  expect(result).toBe("Basic MTIzOjQ1Ng==");
});

it("SpotifyAuthError.create() #1", async () => {
  const rawError = {
    error: "invalid_client",
    error_description: "Somehting went wrong"
  };
  const error = await AuthError.create(new Response(JSON.stringify(rawError)));

  expect(error).toBeInstanceOf(AuthError);
  expect(error.message).toBe("invalid_client");
  expect(error.status).toBe(200);
  expect(error.raw).toMatchObject(rawError);
});

it("SpotifyAuthError.create() #2", async () => {
  const error = await AuthError.create(
    new Response("Unexpected error", { status: 500 })
  );

  expect(error).toBeInstanceOf(AuthError);
  expect(error.message).toBe("Unexpected error");
  expect(error.status).toBe(500);
  expect(error.raw).toBe("Unexpected error");
});
