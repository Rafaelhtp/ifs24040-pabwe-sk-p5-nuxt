import { describe, it, expect } from "vitest";
import routerOptions, { checkAuthNavigation } from "./router.options";
import { routes } from "./routes";

describe("router.options", () => {
  it("exports custom router configuration that maps routes", () => {
    expect(typeof routerOptions.routes).toBe("function");
    const resolvedRoutes = routerOptions.routes?.([]);
    expect(resolvedRoutes).toEqual(routes);
  });

  it("checks auth navigation correctly via checkAuthNavigation", () => {
    // Protected route without token -> redirect to /auth/login
    expect(checkAuthNavigation("/", null)).toBe("/auth/login");
    expect(checkAuthNavigation("/profile", null)).toBe("/auth/login");

    // Protected route with token -> allow (returns null)
    expect(checkAuthNavigation("/", "valid-token")).toBeNull();

    // Auth route with token -> redirect to /
    expect(checkAuthNavigation("/auth/login", "valid-token")).toBe("/");
    expect(checkAuthNavigation("/auth/register", "valid-token")).toBe("/");

    // Auth route without token -> allow (returns null)
    expect(checkAuthNavigation("/auth/login", null)).toBeNull();
  });
});
