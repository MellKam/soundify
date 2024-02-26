/**
 * An [ISO 3166-1 alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
 * If a country code is specified, only content that is available in that market will be returned.<br/>
 * If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.<br/>
 *
 * _**Note**: If neither market or user country are provided, the content is considered unavailable for the client._<br/>
 * Users can view the country that is associated with their account in the [account settings](https://www.spotify.com/se/account/overview/).
 *
 * @example "ES"
 */
export type Market = string;
