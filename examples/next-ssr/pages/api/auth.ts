import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { setCookie } from "cookies-next";
import { authFlow, env, STATE } from "../../spotify";

export default function (req: NextApiRequest, res: NextApiResponse) {
  const state = randomUUID();

  setCookie(STATE, state, {
    httpOnly: true,
    path: "/api/callback",
    req,
    res
  });

  res.redirect(
    authFlow
      .getAuthURL({
        scopes: ["user-read-email"],
        state,
        redirect_uri: env.redirect_uri
      })
      .toString()
  );
}
