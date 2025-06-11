import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  layout("routes/layout.tsx", [
    route("home", "routes/home.tsx"),
    route("simulation", "routes/simulation.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
  ...prefix("api", [route("sessions", "routes/api/sessions.tsx")]),
] satisfies RouteConfig;
