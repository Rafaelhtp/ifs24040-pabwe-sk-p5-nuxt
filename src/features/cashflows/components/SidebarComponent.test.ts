import { describe, it, expect, vi } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders, createMockRouter } from "~/test-utils";

describe("SidebarComponent", () => {
  it("renders menu items properly", () => {
    const wrapper = renderWithProviders(SidebarComponent, {
      props: {
        isOpen: true,
      },
    });

    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
    expect(wrapper.text()).toContain("IFS24040");
  });

  it("handles backdrop click and close button", async () => {
    const onClose = vi.fn();
    const wrapper = renderWithProviders(SidebarComponent, {
      props: {
        isOpen: true,
        onClose,
      },
    });

    await wrapper.find("[data-testid='sidebar-backdrop']").trigger("click");
    expect(onClose).toHaveBeenCalled();

    await wrapper.find("[data-testid='btn-close-sidebar']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(2);

    await wrapper.find("[data-testid='nav-link-home']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("highlights current route based on active path", async () => {
    const router = createMockRouter("/");
    const wrapper = renderWithProviders(SidebarComponent, {
      props: {
        isOpen: false,
      },
      router,
    });

    await router.push("/users");
    await wrapper.vm.$nextTick();

    const usersLink = wrapper.find("[data-testid='nav-link-users']");
    expect(usersLink.classes()).toContain("bg-sky-500");
  });
});
