import { describe, it, expect } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import { routes } from "./routes";

type Loader = () => Promise<{ default: unknown }>;

function collectComponents(list: RouteRecordRaw[]): unknown[] {
  return list.flatMap((route) => [route.component, ...collectComponents(route.children ?? [])]);
}

describe("routes (lazy loading)", () => {
  it("memuat setiap layout/halaman secara lazy dan menghasilkan komponen default", async () => {
    const loaders = collectComponents(routes).filter(
      (component): component is Loader => typeof component === "function"
    );

    // 3 auth (layout, login, register) + 5 cashflow/users (layout, home, detail, users, profile) + 1 not-found
    expect(loaders).toHaveLength(9);

    const modules = await Promise.all(loaders.map((load) => load()));
    modules.forEach((mod) => expect(mod.default).toBeDefined());
  });
});
