import { redirect } from "react-router";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { commitSession, getSession } from "~/sessions.server";
import type { Route } from "./+types/sessions";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const body = await request.formData();

  const { idToken } = Object.fromEntries(body);
  if (!idToken || typeof idToken !== "string") {
    return new Response("Invalid ID token", { status: 400 });
  }
  const user = await adminAuth.verifyIdToken(idToken);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  session.set("idToken", idToken);

  return redirect("/home", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
