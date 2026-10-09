import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import CashFlowLayout from "./CashFlowLayout.vue";

function setup() {
  return renderWithProviders(CashFlowLayout, {
    route: "/",
    beforeMount: (pinia) => {
      vi.spyOn(useUsersStore(pinia), "asyncGetProfile").mockResolvedValue(true);
    },
  });
}

describe("CashFlowLayout", () => {
  it("should redirect to login when user is not authenticated", async () => {
    const { wrapper, pinia, router } = await setup();
    await flushPromises();

    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(false);
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
    expect(useUsersStore(pinia).asyncGetProfile).not.toHaveBeenCalled();
  });

  it("should load profile and render navbar, sidebar and content when authenticated", async () => {
    putAccessToken("token-1");
    const { wrapper, pinia, router } = await setup();
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/");
    expect(useUsersStore(pinia).asyncGetProfile).toHaveBeenCalledTimes(1);
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true);
  });

  it("should toggle and close the sidebar", async () => {
    putAccessToken("token-1");
    const { wrapper } = await setup();

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);

    await wrapper.find('[data-testid="navbar-toggle"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });
});
