import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import LoginPage from "./LoginPage.vue";

async function setup(loginResult: boolean) {
  return renderWithProviders(LoginPage, {
    route: "/auth/login",
    beforeMount: (pinia) => {
      vi.spyOn(useAuthStore(pinia), "asyncSetIsAuthLogin").mockResolvedValue(loginResult);
    },
  });
}

describe("LoginPage", () => {
  it("should render email and password inputs", async () => {
    const { wrapper } = await setup(true);
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-password-input").exists()).toBe(true);
    expect(wrapper.text()).toContain("Masuk");
  });

  it("should show validation error when fields are empty", async () => {
    const { wrapper, pinia } = await setup(true);
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="login-error"]').text()).toContain("tidak boleh kosong");
    expect(useAuthStore(pinia).asyncSetIsAuthLogin).not.toHaveBeenCalled();
  });

  it("should login and navigate home on success", async () => {
    const { wrapper, pinia, router } = await setup(true);
    await wrapper.find("#login-email-input").setValue("a@b.c");
    await wrapper.find("#login-password-input").setValue("123456");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(useAuthStore(pinia).asyncSetIsAuthLogin).toHaveBeenCalledWith({ email: "a@b.c", password: "123456" });
    expect(wrapper.find('[data-testid="login-error"]').exists()).toBe(false);
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("should stay on login page when login fails", async () => {
    const { wrapper, router } = await setup(false);
    await wrapper.find("#login-email-input").setValue("a@b.c");
    await wrapper.find("#login-password-input").setValue("salah");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("should disable submit button while loading", async () => {
    const { wrapper, pinia } = await setup(true);
    useAuthStore(pinia).isAuthLogin = true;
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});
