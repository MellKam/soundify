import {
  IAuthProvider,
  JSONValue,
  parseResponse,
  SearchParams,
  toQueryString,
} from "../shared";

type SpotifyRegularErrorObject = {
  error: {
    message: string;
    status: number;
  };
};

export class SpotifyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "SpotifyError";
  }
}

/**
 * Options for fetch method on HTTPClient interface
 */
export interface FetchOpts {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /**
   * Json object that will be stringified and passed to the body of the request.
   * Will be ignored if `body` is specified.
   */
  json?: JSONValue;
  /**
   * Query parameters or, more precisely, search parameters that will be converted into a query string and passed to the url.
   */
  query?: SearchParams;
  /**
   * Custom headers that will be passed to the request and overwrite existing ones.
   */
  headers?: Record<string, string>;
  /**
   * Request body. Will overwrite `json` property if specified.
   */
  body?: BodyInit;
}

export type ExpectedResponse = "json" | "void";

/**
 * Interface that provides a fetch method to make HTTP requests to Spotify API.
 */
export interface HTTPClient {
  /**
   * Sends an HTTP request.
   *
   * @param baseURL
   * The base URL for the API request. Must begin with "/"
   * @param returnType
   * The expected return type of the API response.
   * @param opts
   * Optional request options, such as the request body or query parameters.
   */
  fetch(baseURL: string, responseType: "void", opts?: FetchOpts): Promise<void>;
  fetch<R extends JSONValue = JSONValue>(
    baseURL: string,
    responseType: "json",
    opts?: FetchOpts
  ): Promise<R>;
}

export interface SpotifyClientOpts {
  /**
   * How many times do you want to try again until you throw the error
   *
   * @default 0
   */
  retryTimesOn5xx?: number;
  /**
   * How long in miliseconds do you want to wait until the next retry
   *
   * @default 0
   */
  retryDelayOn5xx?: number;
  /**
   * If it is set to true, it would refetch the same request after a paticular time interval sent by the spotify api in the headers `Retry-After` so you cannot face any obstacles.
   * Otherwise, it will throw an error.
   *
   * @default false
   */
  waitForRateLimit?: boolean;
  onUnauthorized?: () => void;
}

/**
 * A client for making requests to the Spotify API.
 */
export class SpotifyClient<
  T extends IAuthProvider | string = IAuthProvider | string
> implements HTTPClient
{
  private static BASE_HEADERS: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  private authProvider!: T;
  // Bearer access token
  private token: string | undefined;

  /**
   * @param authProvider It is recommended to pass an object that implements `IAuthProvider` to automatically update tokens. If you do not need this behavior,you can simply pass an access token.
   * @param opts Additional options for fetch execution, such as the ability to retry on error
   */
  constructor(
    authProvider: T,
    private readonly opts: SpotifyClientOpts = {
      waitForRateLimit: false,
      retryDelayOn5xx: 0,
      retryTimesOn5xx: 0,
    }
  ) {
    this.setAuthProvider(authProvider);
  }

  /**
   * Method that changes the existing authProvider to the specified one
   */
  setAuthProvider(authProvider: T) {
    this.authProvider = authProvider;
    this.token =
      typeof authProvider === "string" ? authProvider : authProvider.token;
  }

  fetch(baseURL: string, hasResponse: "void", opts?: FetchOpts): Promise<void>;
  fetch<R extends JSONValue = JSONValue>(
    baseURL: string,
    responseType: "json",
    opts?: FetchOpts
  ): Promise<R>;
  async fetch<R extends JSONValue = JSONValue>(
    baseURL: string,
    responseType: ExpectedResponse,
    { json, query, method, headers, body }: FetchOpts = {}
  ): Promise<R | void> {
    const url = new URL("https://api.spotify.com/v1" + baseURL);
    if (query) url.search = toQueryString(query);

    const _body = body ? body : json ? JSON.stringify(json) : undefined;
    const _headers = new Headers(SpotifyClient.BASE_HEADERS);
    if (headers) {
      Object.entries(headers).forEach((record) => _headers.append(...record));
    }

    let isRefreshed = false;
    let retries5xx = this.opts.retryTimesOn5xx;

    if (typeof this.authProvider === "object" && !this.token) {
      try {
        this.token = await this.authProvider.refresher();
      } catch (error) {
        if (this.opts.onUnauthorized) this.opts.onUnauthorized();
        throw error;
      }
      isRefreshed = true;
    }

    // recursive function
    const call = async (): Promise<Response> => {
      _headers.set("Authorization", "Bearer " + this.token);

      const res = await fetch(url, {
        method,
        headers: _headers,
        body: _body,
      });

      if (res.ok) return res;

      if (
        res.status === 401 &&
        typeof this.authProvider === "object" &&
        !isRefreshed
      ) {
        if (res.body) res.body.cancel();
        try {
          this.token = await this.authProvider.refresher();
        } catch (error) {
          if (this.opts.onUnauthorized) this.opts.onUnauthorized();
          throw error;
        }

        isRefreshed = true;
        return call();
      }

      if (res.status === 429 && this.opts.waitForRateLimit) {
        // time in seconds
        const retryAfter = Number(res.headers.get("Retry-After"));

        if (retryAfter) {
          if (res.body) res.body.cancel();
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          return call();
        }
      }

      if (res.status.toString().startsWith("5") && retries5xx) {
        if (res.body) res.body.cancel();
        if (this.opts.retryDelayOn5xx) {
          await new Promise((r) => setTimeout(r, this.opts.retryDelayOn5xx));
        }

        retries5xx--;
        return call();
      }

      if (res.status === 401 && this.opts.onUnauthorized) {
        this.opts.onUnauthorized();
      }

      const resBody = await parseResponse<SpotifyRegularErrorObject>(res);

      throw new SpotifyError(
        resBody === null
          ? "null"
          : typeof resBody === "string"
          ? resBody
          : resBody.error.message,
        res.status
      );
    };

    const res = await call();

    if (responseType === "json") {
      if (!res.body) throw new Error("Body not found");
      return (await res.json()) as R;
    }
    if (res.body) res.body.cancel();
  }
}
