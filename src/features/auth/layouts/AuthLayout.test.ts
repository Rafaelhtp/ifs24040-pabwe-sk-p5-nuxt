import { describe, expect, it } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("should render branding and login/register tabs", async () => {
    const { wrapper, router } = await renderWithProviders(AuthLayout, { route: "/auth/login" });

    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.find('[data-testid="tab-login"]').attributes("href")).toBe("/auth/login");
    expect(wrapper.find('[data-testid="tab-register"]').attributes("href")).toBe("/auth/register");
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true);
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("should redirect to home when user is already authenticated", async () => {
    putAccessToken("token-1");
    const { router } = await renderWithProviders(AuthLayout, { route: "/auth/login" });
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/home");
  });
});
