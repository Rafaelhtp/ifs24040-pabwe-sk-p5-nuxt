import { describe, it, expect, vi } from "vitest";
import CashFlowLayout from "./CashFlowLayout.vue";
import { renderWithProviders } from "~/test-utils";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

describe("CashFlowLayout", () => {
  it("renders Navbar, Sidebar, and main router area", () => {
    const wrapper = renderWithProviders(CashFlowLayout);
    expect(wrapper.find("[data-testid='navbar']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='sidebar']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='layout-main']").exists()).toBe(true);
  });

  it("toggles and closes sidebar state", async () => {
    const wrapper = renderWithProviders(CashFlowLayout);
    expect(wrapper.vm.isSidebarOpen).toBe(false);

    wrapper.vm.toggleSidebar();
    expect(wrapper.vm.isSidebarOpen).toBe(true);

    wrapper.vm.closeSidebar();
    expect(wrapper.vm.isSidebarOpen).toBe(false);
  });
});
