import { faker } from "@faker-js/faker";
import { AuthScope, KeypairResponse, SCOPES } from "./general";

export const getRandomScopes = (): AuthScope[] => {
  return faker.helpers.arrayElements(Object.values(SCOPES));
};

export const getKeypairResponse = (): KeypairResponse => {
  return {
    refresh_token: faker.random.alphaNumeric(64),
    access_token: faker.random.alphaNumeric(64),
    expires_in: 3600,
    token_type: "Bearer",
    scope: getRandomScopes().join(" "),
  };
};
