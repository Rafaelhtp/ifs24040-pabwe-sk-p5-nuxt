import tailwindcss from "@tailwindcss/vite";

const appPort = Number(process.env.APP_PORT) || 3000;
const delcomBaseUrl = process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  ssr: false,
  srcDir: "src/",
  pages: true,
  modules: ["@pinia/nuxt"],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "id",
      },
      title: "Delcom Cash Flow",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
        },
      ],
    },
  },

  css: ["~/index.css"],

  devServer: {
    port: appPort,
  },

  nitro: {
    devPort: appPort,
  },

  runtimeConfig: {
    public: {
      delcomBaseUrl,
    },
  },

  define: {
    DELCOM_BASEURL: JSON.stringify(delcomBaseUrl),
  },
});
