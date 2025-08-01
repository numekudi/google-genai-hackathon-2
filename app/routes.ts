import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/rootLayout.tsx", [
    index("routes/index.tsx"),
    layout("routes/layout.tsx", [
      route("home", "routes/home.tsx"),
      route("simulation", "routes/simulation.tsx"),
      route("settings", "routes/settings.tsx"),
      route("trends", "routes/trends.tsx"),
    ]),
  ]),
  ...prefix("api", [
    route("sessions", "routes/api/sessions.tsx"),
    route("posts", "routes/api/posts.tsx"),
    route("users", "routes/api/users.tsx"),
    route("trends", "routes/api/trends.tsx"),
    route("simulation", "routes/api/simulation.tsx"),
  ]),
] satisfies RouteConfig;
