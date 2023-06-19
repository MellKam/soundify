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
    code: faker.string.alphanumeric(128),
    state: faker.string.alphanumeric(64)
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData with error", () => {
  const callbackData: AuthCodeCallbackData = {
    error: faker.lorem.lines(),
    state: faker.string.alphanumeric(64)
  };

  const result = parseCallbackData(new URLSearchParams(callbackData));

  expect(result).toMatchObject(callbackData);
});

it("parseCallbackData without state", () => {
  const callbackData: AuthCodeCallbackData = {
    code: faker.string.alphanumeric(128)
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
  expect(getBasicAuthHeader("123", "456")).toBe("Basic MTIzOjQ1Ng==");
});
