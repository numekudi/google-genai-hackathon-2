import { useEffect } from "react";
import { Outlet, useFetcher } from "react-router";
import { auth } from "~/lib/firebase.client";

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
  return <Outlet />;
}
