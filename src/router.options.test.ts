import { describe, expect, it } from "vitest";
import routerOptions from "./router.options";
import routes from "./routes";

describe("router.options", () => {
  it("should supply routes from src/routes.ts", () => {
    const resolveRoutes = routerOptions.routes as unknown as () => unknown;
    expect(resolveRoutes()).toBe(routes);
  });
});
