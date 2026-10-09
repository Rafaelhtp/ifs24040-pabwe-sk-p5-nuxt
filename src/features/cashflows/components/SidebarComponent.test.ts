import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

describe("SidebarComponent", () => {
  it("should render the three menu links", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });

    const links = wrapper.findAll("nav a");
    expect(links.map((link) => link.attributes("href"))).toEqual(["/", "/users", "/profile"]);
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should not render backdrop when closed", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("should emit close when backdrop is clicked", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("should emit close when close button is clicked", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await wrapper.find('[data-testid="sidebar-close"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("should emit close when a menu link is clicked", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await wrapper.findAll("nav a")[1].trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
