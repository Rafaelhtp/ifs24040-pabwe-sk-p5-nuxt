import { describe, it, expect } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "~/test-utils";

describe("AuthLayout", () => {
  it("renders app title and branding properly", () => {
    const wrapper = renderWithProviders(AuthLayout);
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.text()).toContain("Aplikasi Manajemen Arus Kas & Finansial");
  });
});
