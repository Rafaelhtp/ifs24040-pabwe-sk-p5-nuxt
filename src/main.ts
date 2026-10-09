import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";

// Entry point mode Vite murni (bun run dev:vite). Pada mode Nuxt, root component dan Pinia diatur Nuxt.
createApp(App).use(createPinia()).use(router).mount("#app");
