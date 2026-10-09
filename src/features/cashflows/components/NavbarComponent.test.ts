import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import NavbarComponent from "./NavbarComponent.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showConfirmDialog: vi.fn() };
});

function setup() {
  return renderWithProviders(NavbarComponent, {
    route: "/",
    beforeMount: (pinia) => {
      vi.spyOn(useAuthStore(pinia), "asyncSetIsAuthLogout").mockResolvedValue();
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NavbarComponent", () => {
  it("should render identity of the active profile", async () => {
    const { wrapper, pinia } = await setup();
    useUsersStore(pinia).profile = { id: 1, name: "Delcom", email: "a@b.c" };
    await flushPromises();

    const identity = wrapper.find('[data-testid="navbar-identity"]').text();
    expect(identity).toContain("Delcom");
    expect(identity).toContain("a@b.c");
  });

  it("should render empty identity when profile has not been loaded", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="navbar-identity"]').text()).toBe("");
  });

  it("should emit toggle-sidebar", async () => {
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="navbar-toggle"]').trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("should not logout when confirmation is cancelled", async () => {
    (showConfirmDialog as any).mockResolvedValue(false);
    const { wrapper, pinia, router } = await setup();

    await wrapper.find('[data-testid="navbar-logout"]').trigger("click");
    await flushPromises();

    expect(useAuthStore(pinia).asyncSetIsAuthLogout).not.toHaveBeenCalled();
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("should logout and go to login page when confirmed", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia, router } = await setup();

    await wrapper.find('[data-testid="navbar-logout"]').trigger("click");
    await flushPromises();

    expect(useAuthStore(pinia).asyncSetIsAuthLogout).toHaveBeenCalledTimes(1);
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("should disable logout button while logging out", async () => {
    const { wrapper, pinia } = await setup();
    useAuthStore(pinia).isAuthLogout = true;
    await flushPromises();

    expect(wrapper.find('[data-testid="navbar-logout"]').attributes("disabled")).toBeDefined();
  });
});
