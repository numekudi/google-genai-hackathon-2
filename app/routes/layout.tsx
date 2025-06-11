import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import { adminAuth } from "~/lib/firebaseAdmin.server";
import { getSession } from "~/sessions.server";
import Footer from "../components/footer";

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
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
