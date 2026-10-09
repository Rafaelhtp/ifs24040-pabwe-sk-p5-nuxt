import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { deferNuxtCss } from "./server/utils/deferCss";

const appPort = Number(process.env.APP_PORT) || 3000;
const delcomBaseUrl = process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  telemetry: false,
  ssr: false,
  srcDir: "src/",
  serverDir: "server",
  pages: true,
  modules: ["@pinia/nuxt"],

  experimental: {
    appManifest: false,
  },

  hooks: {
    // Daftarkan rute langsung dari sini (tidak bergantung lokasi router.options di Nuxt 3/4).
    // Struktur sama dengan src/routes.ts.
    "pages:extend"(pages) {
      pages.splice(
        0,
        pages.length,
        {
          path: "/auth",
          file: src("features/auth/layouts/AuthLayout.vue"),
          children: [
            { path: "login", name: "login", file: src("features/auth/pages/LoginPage.vue") },
            { path: "register", name: "register", file: src("features/auth/pages/RegisterPage.vue") },
            { path: "", file: src("features/auth/pages/LoginPage.vue") },
          ],
        },
        {
          path: "/",
          file: src("features/cashflows/layouts/CashFlowLayout.vue"),
          meta: { requiresAuth: true },
          children: [
            { path: "", name: "home", file: src("features/cashflows/pages/HomePage.vue") },
            {
              path: "cash-flows/:cashFlowId",
              name: "cash-flow-detail",
              file: src("features/cashflows/pages/DetailPage.vue"),
            },
            { path: "users", name: "users", file: src("features/users/pages/UsersPage.vue") },
            { path: "profile", name: "profile", file: src("features/users/pages/ProfilePage.vue") },
          ],
        },
        {
          path: "/:pathMatch(.*)*",
          name: "not-found",
          file: src("features/common/pages/NotFoundPage.vue"),
        },
      );
    },

    // Nuxt mencari app.vue (huruf kecil) yang tidak cocok dengan src/App.vue di Linux/Vercel.
    // Paksa Nuxt memakai src/App.vue sebagai root component.
    "app:resolve"(app) {
      app.rootComponent = fileURLToPath(new URL("./src/App.vue", import.meta.url));
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "id",
      },
      title: "Delcom Cash Flow",
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow: aplikasi pencatat arus kas pribadi untuk memantau pemasukan, pengeluaran, tabungan, dan pinjaman.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        // Font dimuat non-blocking: media=print lalu diaktifkan setelah terunduh
        {
          rel: "stylesheet",
          href: FONT_URL,
          media: "print",
          onload: "this.media='all'",
        },
      ],
      noscript: [{ innerHTML: `<link rel="stylesheet" href="${FONT_URL}">` }],
      // CSS kritis minimal agar tidak ada flash putih sebelum stylesheet utama aktif
      style: [{ innerHTML: "body{margin:0;background-color:#020617;color:#f1f5f9}" }],
    },
  },

  css: ["~/index.css"],

  devServer: {
    port: appPort,
  },

  // HTML tidak boleh "no-store" agar halaman bisa dipulihkan dari back/forward cache (bfcache).
  routeRules: {
    "/": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/auth/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },

  nitro: {
    devPort: appPort,
    hooks: {
      // Untuk HTML yang di-prerender saat build (200.html / index.html)
      "prerender:generate"(route) {
        if (typeof route.contents === "string" && route.fileName?.endsWith(".html")) {
          route.contents = deferNuxtCss(route.contents);
        }
      },
    },
  },

  runtimeConfig: {
    public: {
      delcomBaseUrl,
    },
  },
});