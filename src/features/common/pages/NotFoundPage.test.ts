import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("should render 404 message and link back home", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("halaman tidak ditemukan");
    expect(wrapper.find("a").attributes("href")).toBe("/home");
  });
});
