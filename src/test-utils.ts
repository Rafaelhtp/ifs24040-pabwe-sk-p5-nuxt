import { h, type Component } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

/** Halaman dummy agar RouterView/RouterLink bisa me-resolve rute apa pun saat testing. */
const Stub = { render: () => h("div", { "data-testid": "route-stub" }) };

export const defaultRoutes: RouteRecordRaw[] = [{ path: "/:pathMatch(.*)*", component: Stub }];

/** Pinia asli (bukan testing pinia) dengan state awal opsional per store. */
export function createMockPinia(initialState: Record<string, unknown> = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  pinia.state.value = { ...initialState };
  return pinia;
}

interface RenderOptions {
  props?: Record<string, unknown>;
  route?: string;
  routes?: RouteRecordRaw[];
  initialState?: Record<string, unknown>;
  stubs?: Record<string, unknown>;
  attachTo?: HTMLElement;
  /** Dijalankan sebelum komponen di-mount (mis. untuk spy aksi store / mengisi state). */
  beforeMount?: (pinia: ReturnType<typeof createPinia>) => void;
}

export async function renderWithProviders(component: Component, options: RenderOptions = {}) {
  const pinia = createMockPinia(options.initialState);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes ?? defaultRoutes,
  });
  router.push(options.route ?? "/");
  await router.isReady();
  options.beforeMount?.(pinia);

  const wrapper = mount(component, {
    props: options.props,
    attachTo: options.attachTo,
    global: {
      plugins: [pinia, router],
      stubs: options.stubs as any,
    },
  });
  await flushPromises();

  return { wrapper, pinia, router };
}
