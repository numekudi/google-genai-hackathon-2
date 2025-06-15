import { useEffect } from "react";
import {
  Outlet,
  redirect,
  useFetcher,
  type LoaderFunctionArgs,
} from "react-router";
import { auth } from "~/lib/firebase.client";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getSession } from "~/sessions.server";
import MenuLayout from "../components/menu-layout";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) {
    return redirect("/");
  }
  try {
    await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return redirect("/");
  }
  return null;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const fetcher = useFetcher();
  useEffect(() => {
    const unSub = auth.onIdTokenChanged(async (user) => {
      if (user) {
        console.log("id token changed");
        const idToken = await user.getIdToken();
        fetcher.submit(
          { idToken },
          { method: "post", action: "/api/sessions" }
        );
      }
    });
    return unSub;
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <MenuLayout>
          <Outlet />
        </MenuLayout>
      </main>
    </div>
  );
}
