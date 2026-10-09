import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "./LoginPage.vue";
import { renderWithProviders } from "~/test-utils";
import { useAuthStore } from "../states/authStore";
import * as toolsHelper from "~/helpers/toolsHelper";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders input fields and login button", () => {
    const wrapper = renderWithProviders(LoginPage);
    expect(wrapper.find("[data-testid='input-email']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-password']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='btn-login']").exists()).toBe(true);
  });

  it("shows error dialog if fields are empty on submit", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(LoginPage);

    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Semua field harus diisi.");
    expect(wrapper.find("[data-testid='error-message']").text()).toBe("Semua field harus diisi.");
  });

  it("submits form successfully and navigates to home", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(LoginPage);
    const store = useAuthStore();
    const loginSpy = vi.spyOn(store, "asyncLogin").mockResolvedValueOnce(true);

    const emailInput = wrapper.find("[data-testid='input-email']");
    const passwordInput = wrapper.find("[data-testid='input-password']");

    await emailInput.setValue("user@delcom.org");
    await passwordInput.setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(loginSpy).toHaveBeenCalledWith({
      email: "user@delcom.org",
      password: "password123",
    });
    expect(successSpy).toHaveBeenCalledWith("Berhasil Masuk", "Selamat datang kembali!");
  });

  it("handles login error and shows error dialog", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(LoginPage);
    const store = useAuthStore();
    vi.spyOn(store, "asyncLogin").mockRejectedValueOnce(new Error("Email atau password salah"));

    await wrapper.find("[data-testid='input-email']").setValue("user@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("wrong");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Gagal Masuk", "Email atau password salah");
    expect(wrapper.find("[data-testid='error-message']").text()).toBe("Email atau password salah");
  });

  it("handles login error without message property", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(LoginPage);
    const store = useAuthStore();
    vi.spyOn(store, "asyncLogin").mockRejectedValueOnce({});

    await wrapper.find("[data-testid='input-email']").setValue("user@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("wrong");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Gagal Masuk", "Gagal masuk ke akun.");
  });

  it("displays loading label when isAuthLogin is true", () => {
    const wrapper = renderWithProviders(LoginPage, {
      initialState: {
        auth: {
          isAuthLogin: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='btn-login']").text()).toContain("Memproses...");
  });
});
