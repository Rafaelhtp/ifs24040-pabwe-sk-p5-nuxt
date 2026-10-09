/// <reference types="vite/client" />

// Konstanta global hasil injeksi `define` dari nuxt.config.ts / vite.config.ts
declare const DELCOM_BASEURL: string;
declare const DELCOM_ORIGIN: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}
