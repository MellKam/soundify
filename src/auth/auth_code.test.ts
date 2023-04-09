import { AuthCode } from "./auth_code";
import createFetchMock from "vitest-fetch-mock";
import { SpotifyAuthError, getBasicAuthHeader } from "./general";
import { faker } from "@faker-js/faker";
import { getKeypairResponse, getRandomScopes } from "./__mocks__";
import { beforeEach, expect } from "vitest";
import { vi, it } from "vitest";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

beforeEach(() => {
  fetchMocker.mockClear();
});

const creds: ConstructorParameters<typeof AuthCode>[0] = {
  client_id: faker.random.alphaNumeric(32),
  client_secret: faker.random.alphaNumeric(86),
};

it("AuthCode: constructor", () => {
  const authFlow = new AuthCode(creds);

  expect(authFlow["basicAuthHeader"]).toBe(
    getBasicAuthHeader(creds.client_id, creds.client_secret)
  );
});

it("AuthCode: getAuthURL", () => {
  const authFlow = new AuthCode(creds);

  const opts = {
    scopes: getRandomScopes(),
    redirect_uri: faker.internet.url(),
    show_dialog: faker.datatype.boolean(),
    state: faker.datatype.uuid(),
  };

  const url = authFlow.getAuthURL(opts);

  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    client_id: creds.client_id,
    scope: opts.scopes.join(" "),
    redirect_uri: opts.redirect_uri,
    response_type: "code",
    show_dialog: opts.show_dialog.toString(),
    state: opts.state,
  });
});

it("AuthCode: getGrantData #1", async () => {
  const authFlow = new AuthCode(creds);

  const redirect_uri = faker.internet.url();
  const code = faker.random.alphaNumeric(48);
  const mockResponse = getKeypairResponse();

  fetchMocker.doMockOnce((req) => {
    const url = new URL(req.url);
    if (url.pathname !== "/api/token") {
      return {
        status: 404,
        body: "Not Found",
      };
    }

    const basicToken = req.headers.get("Authorization");
    expect(basicToken).toBe(
      getBasicAuthHeader(creds.client_id, creds.client_secret)
    );

    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      redirect_uri,
      code,
      grant_type: "authorization_code",
    });

    return { body: JSON.stringify(mockResponse) };
  });

  const result = await authFlow.getGrantData(redirect_uri, code);

  expect(result).toMatchObject(mockResponse);
});

it("AuthCode: getGrantData #2", async () => {
  const authFlow = new AuthCode(creds);

  const redirect_uri = faker.internet.url();
  const code = faker.random.alphaNumeric(48);

  fetchMocker.doMockOnce((req) => {
    const url = new URL(req.url);
    if (url.pathname !== "/api/token") {
      return {
        status: 404,
        body: "Not Found",
      };
    }

    return {
      body: JSON.stringify({
        error: "invalid_client",
        error_description: "Something went wront",
      }),
      status: 500,
    };
  });

  try {
    await authFlow.getGrantData(redirect_uri, code);
  } catch (error) {
    expect(error).toBeInstanceOf(SpotifyAuthError);
    expect(error["status"]).toBe(500);
    expect(error["message"]).toBe("invalid_client");
    expect(error["description"]).toBe("Something went wront");
  }
});
