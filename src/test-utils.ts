import { mount, type MountingOptions } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createRouter, createMemoryHistory, type Router } from "vue-router";
import type { Component } from "vue";
import { routes } from "./routes";

export function createMockPinia(initialState: Record<string, any> = {}): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  for (const [key, state] of Object.entries(initialState)) {
    pinia.state.value[key] = state;
  }
  return pinia;
}

export function createMockRouter(initialRoute = "/"): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });
  return router;
}

export interface RenderWithProvidersOptions extends MountingOptions<any> {
  pinia?: Pinia;
  router?: Router;
  initialRoute?: string;
  initialState?: Record<string, any>;
}

export function renderWithProviders(
  component: Component,
  options: RenderWithProvidersOptions = {}
) {
  const {
    pinia = createMockPinia(options.initialState),
    router = options.router || createMockRouter(),
    global = {},
    ...mountOptions
  } = options;

  if (options.initialRoute) {
    router.push(options.initialRoute);
  }

  return mount(component, {
    ...mountOptions,
    global: {
      ...global,
      plugins: [pinia, router, ...(global.plugins || [])],
      stubs: {
        ...(global.stubs || {}),
      },
    },
  });
}
