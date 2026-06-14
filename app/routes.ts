import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("seguimiento", "routes/seguimiento._index.tsx"),
  route("seguimiento/:codigo", "routes/seguimiento.$codigo.tsx"),
] satisfies RouteConfig;