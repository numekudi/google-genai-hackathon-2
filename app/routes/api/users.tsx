import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getSession } from "~/sessions.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    await adminAuth.deleteUser(decoded.uid);
    return new Response("Account deleted", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Failed to delete account", { status: 500 });
  }
}
