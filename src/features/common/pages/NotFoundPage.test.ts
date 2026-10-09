import { describe, it, expect } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "~/test-utils";

describe("NotFoundPage", () => {
  it("renders 404 message and back home button", () => {
    const wrapper = renderWithProviders(NotFoundPage);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    const link = wrapper.find("[data-testid='btn-back-home']");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/");
  });
});
