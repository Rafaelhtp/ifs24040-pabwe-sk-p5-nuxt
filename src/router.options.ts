import type { RouterConfig } from "@nuxt/schema";
import { routes, checkAuthNavigation } from "./routes";

export default <RouterConfig>{
  routes: (_routes) => routes,
};

export { checkAuthNavigation };
