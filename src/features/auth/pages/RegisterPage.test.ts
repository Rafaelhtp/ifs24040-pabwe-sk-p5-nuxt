import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "~/test-utils";
import { useAuthStore } from "../states/authStore";
import * as toolsHelper from "~/helpers/toolsHelper";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders input fields and register button", () => {
    const wrapper = renderWithProviders(RegisterPage);
    expect(wrapper.find("[data-testid='input-name']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-email']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-password']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-confirm-password']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='btn-register']").exists()).toBe(true);
  });

  it("shows error if any field is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(RegisterPage);

    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Semua field harus diisi.");
    expect(wrapper.find("[data-testid='error-message']").text()).toBe("Semua field harus diisi.");
  });

  it("shows error if passwords do not match", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(RegisterPage);

    await wrapper.find("[data-testid='input-name']").setValue("Rafael Nobel");
    await wrapper.find("[data-testid='input-email']").setValue("rafael@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("password123");
    await wrapper.find("[data-testid='input-confirm-password']").setValue("mismatch");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Konfirmasi kata sandi tidak cocok.");
    expect(wrapper.find("[data-testid='error-message']").text()).toBe("Konfirmasi kata sandi tidak cocok.");
  });

  it("submits registration successfully and redirects to login", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(RegisterPage);
    const store = useAuthStore();
    const registerSpy = vi.spyOn(store, "asyncRegister").mockResolvedValueOnce(true);

    await wrapper.find("[data-testid='input-name']").setValue("Rafael Nobel");
    await wrapper.find("[data-testid='input-email']").setValue("rafael@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("password123");
    await wrapper.find("[data-testid='input-confirm-password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(registerSpy).toHaveBeenCalledWith({
      name: "Rafael Nobel",
      email: "rafael@delcom.org",
      password: "password123",
    });
    expect(successSpy).toHaveBeenCalledWith(
      "Pendaftaran Berhasil",
      "Silakan masuk dengan akun Anda."
    );
  });

  it("handles registration error and shows error dialog", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(RegisterPage);
    const store = useAuthStore();
    vi.spyOn(store, "asyncRegister").mockRejectedValueOnce(new Error("Email sudah terdaftar"));

    await wrapper.find("[data-testid='input-name']").setValue("Rafael Nobel");
    await wrapper.find("[data-testid='input-email']").setValue("rafael@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("password123");
    await wrapper.find("[data-testid='input-confirm-password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Pendaftaran Gagal", "Email sudah terdaftar");
  });

  it("handles registration error without message property", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValueOnce({} as any);
    const wrapper = renderWithProviders(RegisterPage);
    const store = useAuthStore();
    vi.spyOn(store, "asyncRegister").mockRejectedValueOnce({});

    await wrapper.find("[data-testid='input-name']").setValue("Rafael Nobel");
    await wrapper.find("[data-testid='input-email']").setValue("rafael@delcom.org");
    await wrapper.find("[data-testid='input-password']").setValue("password123");
    await wrapper.find("[data-testid='input-confirm-password']").setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Pendaftaran Gagal", "Gagal melakukan pendaftaran.");
  });

  it("displays loading label when isAuthRegister is true", () => {
    const wrapper = renderWithProviders(RegisterPage, {
      initialState: {
        auth: {
          isAuthRegister: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='btn-register']").text()).toContain("Mendaftarkan...");
  });
});
