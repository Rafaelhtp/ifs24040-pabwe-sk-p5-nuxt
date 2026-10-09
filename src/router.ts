import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";

// Router khusus mode Vite murni (bun run dev:vite). Mode Nuxt memakai router.options.ts.
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
