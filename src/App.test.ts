import { describe, expect, it } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "./test-utils";
import App from "./App.vue";
import routes from "./routes";

describe("App", () => {
  it("should render the login page on /auth/login", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/auth/login", routes });
    await flushPromises();

    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
  });

  it("should render the register page on /auth/register", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/auth/register", routes });
    await flushPromises();

    expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true);
  });

  it("should redirect /auth to the login page", async () => {
    const { router } = await renderWithProviders(App, { route: "/auth", routes });
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("should redirect protected routes to login when not authenticated", async () => {
    const { wrapper, router } = await renderWithProviders(App, { route: "/", routes });
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true);
  });

  it("should render the not found page for unknown routes", async () => {
    const { wrapper } = await renderWithProviders(App, { route: "/halaman-tidak-ada", routes });
    await flushPromises();

    expect(wrapper.text()).toContain("404");
  });
});
