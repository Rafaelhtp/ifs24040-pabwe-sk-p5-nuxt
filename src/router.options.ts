import type { RouterConfig } from "@nuxt/schema";
import routes from "./routes";

// Opsi router kustom untuk Nuxt — semua rute didefinisikan di src/routes.ts
export default <RouterConfig>{
  routes: () => routes,
};
