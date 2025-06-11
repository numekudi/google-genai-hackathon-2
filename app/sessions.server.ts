import { createCookieSessionStorage } from "react-router";

type SessionData = {
  idToken: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 * 30,
      path: "/",
      sameSite: "lax",
      secure: true,
    },
  });

export { commitSession, destroySession, getSession };
