import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

const delcomBaseUrl = process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    DELCOM_BASEURL: JSON.stringify(delcomBaseUrl),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      include: [
        "src/helpers/**/*.ts",
        "src/hooks/**/*.ts",
        "src/features/**/*.{ts,vue}",
        "src/routes.ts",
        "src/router.options.ts",
        "src/App.vue",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "src/setupTests.ts",
        "src/test-utils.ts",
        "src/main.ts",
      ],
    },
  },
});
