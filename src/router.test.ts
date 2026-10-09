import { describe, expect, it } from "vitest";
import type { RouteRecordRaw } from "vue-router";
import router from "./router";
import routes from "./routes";

function collectLoaders(list: RouteRecordRaw[]): Array<() => Promise<unknown>> {
  return list.flatMap((route) => [
    ...(typeof route.component === "function" ? [route.component as () => Promise<unknown>] : []),
    ...collectLoaders(route.children ?? []),
  ]);
}

describe("router", () => {
  it("should lazy-load every page and layout component", async () => {
    const loaders = collectLoaders(routes);
    expect(loaders.length).toBe(9);
    const modules = await Promise.all(loaders.map((load) => load()));
    modules.forEach((mod) => expect(mod).toHaveProperty("default"));
  });

  it("should register all application routes", () => {
    expect(router.getRoutes().length).toBeGreaterThanOrEqual(routes.length);
  });

  it.each([
    ["/auth/login", "/auth/login"],
    ["/auth/register", "/auth/register"],
    ["/home", "/home"],
    ["/cash-flows/12", "/cash-flows/:cashFlowId"],
    ["/users", "/users"],
    ["/profile", "/profile"],
    ["/tidak-ada", "/:pathMatch(.*)*"],
  ])("should resolve %s", (path, expectedPath) => {
    const resolved = router.resolve(path);
    const matchedPaths = resolved.matched.map((record) => record.path);
    expect(matchedPaths.some((p) => p.endsWith(expectedPath) || p === expectedPath)).toBe(true);
  });
});
