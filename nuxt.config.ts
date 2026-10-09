import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { deferNuxtCss } from "./server/utils/deferCss";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

const delcomBaseUrl = process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

// Request API dari browser dialirkan lewat proxy same-origin (server/api/delcom/[...path].ts).
// Isi VITE_DELCOM_DIRECT=true lalu build ulang bila ingin menghubungi Delcom tanpa proxy.
const useDirectApi = process.env.VITE_DELCOM_DIRECT === "true";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,

  // SPA mode: SSR dimatikan karena aplikasi bergantung pada storage browser
  ssr: false,

  // Sumber aplikasi berada di direktori src/
  srcDir: "src/",

  // Aktifkan vue-router; daftar rute diambil dari src/router.options.ts
  pages: true,

  css: ["~/index.css"],

  modules: ["@pinia/nuxt"],

  hooks: {
    // Paksa Nuxt memakai src/App.vue sebagai root component
    "app:resolve"(app) {
      app.rootComponent = fileURLToPath(new URL("./src/App.vue", import.meta.url));
    },
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(useDirectApi ? delcomBaseUrl : "/api/delcom"),
      DELCOM_ORIGIN: JSON.stringify(new URL(delcomBaseUrl).origin),
    },
  },

  devServer: {
    port: customPort,
  },

  // Header cache dibuka supaya halaman bisa dipulihkan lewat back/forward cache (bfcache).
  routeRules: {
    "/": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/auth/**": { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    "/_nuxt/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
  },

  nitro: {
    devPort: customPort,
    hooks: {
      // Berlaku untuk HTML hasil prerender (200.html / index.html)
      "prerender:generate"(route) {
        if (typeof route.contents === "string" && route.fileName?.endsWith(".html")) {
          route.contents = deferNuxtCss(route.contents);
        }
      },
    },
    externals: {
      inline: ["@vue/shared"],
    },
  },

  app: {
    head: {
      title: "Delcom Cash Flow",
      htmlAttrs: {
        lang: "id",
      },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        // Font dimuat tanpa memblokir render: diawali media=print lalu diaktifkan setelah selesai diunduh
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow: aplikasi pencatat arus kas pribadi untuk memantau pemasukan, pengeluaran, tabungan, dan pinjaman.",
        },
      ],
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">',
        },
      ],
      // CSS kritis minimal supaya layar tidak berkedip putih sebelum stylesheet utama termuat
      style: [{ innerHTML: "body{background-color:#f5f5f4;color:#0f172a}" }],
      bodyAttrs: {
        class: "bg-stone-100 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});
