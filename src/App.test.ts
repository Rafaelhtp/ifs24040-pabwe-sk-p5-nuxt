import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App.vue";
import { renderWithProviders } from "./test-utils";
import * as routesModule from "./routes";

describe("App.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders app wrapper properly", () => {
    const wrapper = renderWithProviders(App, { initialRoute: "/auth/login" });
    expect(wrapper.find("#app").exists()).toBe(true);
  });

  it("triggers redirect when checkAuthNavigation returns a route", async () => {
    const spy = vi.spyOn(routesModule, "checkAuthNavigation").mockReturnValue("/auth/login");
    const wrapper = renderWithProviders(App, { initialRoute: "/" });
    await wrapper.vm.$nextTick();

    expect(spy).toHaveBeenCalled();
  });
});
