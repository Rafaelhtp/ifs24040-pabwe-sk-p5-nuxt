import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import RegisterPage from "./RegisterPage.vue";

async function setup(registerResult: boolean) {
  return renderWithProviders(RegisterPage, {
    route: "/auth/register",
    beforeMount: (pinia) => {
      vi.spyOn(useAuthStore(pinia), "asyncSetIsAuthRegister").mockResolvedValue(registerResult);
    },
  });
}

async function fill(wrapper: any, name: string, email: string, password: string) {
  await wrapper.find("#name").setValue(name);
  await wrapper.find("#email").setValue(email);
  await wrapper.find("#password").setValue(password);
}

describe("RegisterPage", () => {
  it("should render name, email and password inputs", async () => {
    const { wrapper } = await setup(true);
    expect(wrapper.find("#name").exists()).toBe(true);
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(true);
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });

  it("should show error when a field is empty", async () => {
    const { wrapper, pinia } = await setup(true);
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="register-error"]').text()).toContain("wajib diisi");
    expect(useAuthStore(pinia).asyncSetIsAuthRegister).not.toHaveBeenCalled();
  });

  it("should show error when password is too short", async () => {
    const { wrapper, pinia } = await setup(true);
    await fill(wrapper, "Delcom", "a@b.c", "123");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="register-error"]').text()).toContain("minimal 6");
    expect(useAuthStore(pinia).asyncSetIsAuthRegister).not.toHaveBeenCalled();
  });

  it("should register and navigate to login on success", async () => {
    const { wrapper, pinia, router } = await setup(true);
    await fill(wrapper, "Delcom", "a@b.c", "123456");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(useAuthStore(pinia).asyncSetIsAuthRegister).toHaveBeenCalledWith({
      name: "Delcom",
      email: "a@b.c",
      password: "123456",
    });
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("should stay on register page when registration fails", async () => {
    const { wrapper, router } = await setup(false);
    await fill(wrapper, "Delcom", "a@b.c", "123456");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/auth/register");
  });

  it("should disable submit button while loading", async () => {
    const { wrapper, pinia } = await setup(true);
    useAuthStore(pinia).isAuthRegister = true;
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});
