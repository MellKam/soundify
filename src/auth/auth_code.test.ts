import { AuthCodeFlow } from "./auth_code";
import createFetchMock from "vitest-fetch-mock";
import {
  AuthError,
  SpotifyAuthErrorObject,
  getBasicAuthHeader
} from "./general";
import { faker } from "@faker-js/faker";
import {
  getKeypairResponse,
  getRandomScopes,
  getScopedResponse
} from "./__mocks__";
import { afterEach, beforeEach, expect } from "vitest";
import { vi, it } from "vitest";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

let authFlow: AuthCodeFlow;
let creds: ConstructorParameters<typeof AuthCodeFlow>[0];

beforeEach(() => {
  creds = {
    client_id: faker.random.alphaNumeric(32),
    client_secret: faker.random.alphaNumeric(86)
  };

  authFlow = new AuthCodeFlow(creds);
});

afterEach(() => {
  fetchMocker.mockClear();
  vi.clearAllMocks();
});

it("AuthCode: constructor", () => {
  expect(authFlow["basicAuthHeader"]).toBe(
    getBasicAuthHeader(creds.client_id, creds.client_secret)
  );
});

it("AuthCode: getAuthURL", () => {
  const opts = {
    scopes: getRandomScopes(),
    redirect_uri: faker.internet.url(),
    show_dialog: faker.datatype.boolean(),
    state: faker.datatype.uuid()
  };

  const url = authFlow.getAuthURL(opts);

  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    client_id: creds.client_id,
    scope: opts.scopes.join(" "),
    redirect_uri: opts.redirect_uri,
    response_type: "code",
    show_dialog: opts.show_dialog.toString(),
    state: opts.state
  });
});

it("AuthCode: getGrantData #1", async () => {
  const redirect_uri = faker.internet.url();
  const code = faker.random.alphaNumeric(48);
  const mockResponse = getKeypairResponse();

  fetchMocker.doMockOnce(req => {
    const url = new URL(req.url);
    expect(req.method).toBe("POST");
    expect(url.pathname).toBe("/api/token");

    const basicToken = req.headers.get("Authorization");
    expect(basicToken).toBe(
      getBasicAuthHeader(creds.client_id, creds.client_secret)
    );

    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      redirect_uri,
      code,
      grant_type: "authorization_code"
    });

    return { body: JSON.stringify(mockResponse) };
  });

  const result = await authFlow.getGrantData(redirect_uri, code);

  expect(result).toMatchObject(mockResponse);
});

it("AuthCode: getGrantData #2", async () => {
  const rawError: SpotifyAuthErrorObject = {
    error: "invalid_client",
    error_description: "Something went wront"
  };

  fetchMocker.doMockOnce(req => {
    const url = new URL(req.url);
    expect(req.method).toBe("POST");
    expect(url.pathname).toBe("/api/token");

    return { body: JSON.stringify(rawError), status: 500 };
  });

  try {
    await authFlow.getGrantData(
      faker.internet.url(),
      faker.random.alphaNumeric(48)
    );
  } catch (error) {
    expect(error).toBeInstanceOf(AuthError);
    if (!(error instanceof AuthError)) return;
    expect(error.status).toBe(500);
    expect(error.message).toBe("invalid_client");
    expect(error.raw).toMatchObject(rawError);
  }
});

it("AuthCode: refresh #1", async () => {
  const refresh_token = faker.random.alphaNumeric(64);
  const mockResponse = getScopedResponse();

  fetchMocker.doMockOnce(req => {
    const url = new URL(req.url);
    expect(req.method).toBe("POST");
    expect(url.pathname).toBe("/api/token");

    const basicToken = req.headers.get("Authorization");
    expect(basicToken).toBe(
      getBasicAuthHeader(creds.client_id, creds.client_secret)
    );

    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      refresh_token,
      grant_type: "refresh_token"
    });

    return { body: JSON.stringify(mockResponse) };
  });

  const data = await authFlow.refresh(refresh_token);

  expect(data).toMatchObject(mockResponse);
});

it("AuthCode: refresh #2", async () => {
  const refresh_token = faker.random.alphaNumeric(64);
  const rawError: SpotifyAuthErrorObject = {
    error: faker.lorem.lines(1),
    error_description: faker.lorem.lines(1)
  };

  fetchMocker.doMockOnce(req => {
    const url = new URL(req.url);
    expect(req.method).toBe("POST");
    expect(url.pathname).toBe("/api/token");

    return { body: JSON.stringify(rawError), status: 500 };
  });

  try {
    await authFlow.refresh(refresh_token);
  } catch (error) {
    expect(error).toBeInstanceOf(AuthError);
    if (!(error instanceof AuthError)) return;
    expect(error.status).toBe(500);
    expect(error.message).toBe(rawError.error);
    expect(error.raw).toMatchObject(rawError);
  }
});

// it("AuthCode: createRefresher", async () => {
//   const refresh_token = faker.random.alphaNumeric(64);
//   const access_token = faker.random.alphaNumeric(64);
//   const mockResponse = getScopedResponse();

//   const refreshSpy = vi
//     .spyOn(authFlow, "refresh")
//     .mockResolvedValueOnce(mockResponse);
//   const onRefreshSuccess = vi.fn();

//   const refresher = authFlow.createRefresher(refresh_token);

//   expect(authProvider.token).toBe(access_token);

//   await authProvider.refresher();

//   expect(refreshSpy).toBeCalledWith(refresh_token);
//   expect(refreshSpy).toBeCalledTimes(1);
//   expect(onRefreshSuccess).toBeCalledWith(mockResponse);
// });
