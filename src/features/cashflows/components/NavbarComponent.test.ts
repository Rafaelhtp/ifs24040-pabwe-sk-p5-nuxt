import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import * as toolsHelper from "~/helpers/toolsHelper";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders active user details and avatar initial when no photo", () => {
    const pinia = createMockPinia();
    const authStore = useAuthStore(pinia);
    authStore.user = { id: 1, name: "Rafael Nobel", email: "rafael@delcom.org" };

    const wrapper = renderWithProviders(NavbarComponent, { pinia });
    expect(wrapper.find("[data-testid='navbar-user-name']").text()).toBe("Rafael Nobel");
    expect(wrapper.find("[data-testid='navbar-user-email']").text()).toBe("rafael@delcom.org");
    expect(wrapper.find("[data-testid='navbar-user-initial']").text()).toBe("R");
  });

  it("renders user photo when available in usersStore profile", () => {
    const pinia = createMockPinia();
    const usersStore = useUsersStore(pinia);
    usersStore.profile = {
      id: 1,
      name: "Rafael",
      email: "r@delcom.org",
      photo: "https://example.com/avatar.jpg",
    };

    const wrapper = renderWithProviders(NavbarComponent, { pinia });
    expect(wrapper.find("[data-testid='navbar-user-avatar']").exists()).toBe(true);
  });

  it("renders user avatar when available in authStore.user", () => {
    const pinia = createMockPinia();
    const authStore = useAuthStore(pinia);
    authStore.user = {
      id: 1,
      name: "",
      email: "",
      avatar: "https://example.com/user-avatar.png",
    };

    const wrapper = renderWithProviders(NavbarComponent, { pinia });
    expect(wrapper.find("[data-testid='navbar-user-avatar']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='navbar-user-name']").text()).toBe("Pengguna");
    expect(wrapper.find("[data-testid='navbar-user-email']").text()).toBe("Delcom User");
  });

  it("triggers toggle sidebar event callback", async () => {
    const onToggle = vi.fn();
    const wrapper = renderWithProviders(NavbarComponent, {
      props: {
        onToggleSidebar: onToggle,
      },
    });

    await wrapper.find("[data-testid='btn-toggle-sidebar']").trigger("click");
    expect(onToggle).toHaveBeenCalled();
  });

  it("handles logout confirmation and navigates to /auth/login", async () => {
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const authStore = useAuthStore(pinia);
    const logoutSpy = vi.spyOn(authStore, "asyncLogout").mockResolvedValue();

    const wrapper = renderWithProviders(NavbarComponent, { pinia });
    await wrapper.find("[data-testid='btn-logout']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(confirmSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalled();
  });

  it("does not logout if user cancels confirmation dialog", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    const pinia = createMockPinia();
    const authStore = useAuthStore(pinia);
    const logoutSpy = vi.spyOn(authStore, "asyncLogout");

    const wrapper = renderWithProviders(NavbarComponent, { pinia });
    await wrapper.find("[data-testid='btn-logout']").trigger("click");
    await wrapper.vm.$nextTick();

    expect(logoutSpy).not.toHaveBeenCalled();
  });
});
