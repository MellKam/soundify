import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie, setCookie } from "cookies-next";
import { ACCESS_TOKEN, authFlow, REFRESH_TOKEN } from "../../spotify";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const refresh_token = getCookie(REFRESH_TOKEN, {
    req,
    res
  });

  if (typeof refresh_token !== "string") {
    res.status(400).send("Can't find REFRESH_TOKEN");
    return;
  }

  try {
    const { access_token, expires_in } = await authFlow.refresh(refresh_token);

    setCookie(ACCESS_TOKEN, access_token, {
      maxAge: expires_in,
      req,
      res,
      sameSite: "strict"
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).send({ error: String(error) });
  }
}
