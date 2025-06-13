import type { LoaderFunctionArgs } from "react-router";
import { getSession } from "~/sessions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
};

const Home = () => {
  return <div></div>;
};

export default Home;
