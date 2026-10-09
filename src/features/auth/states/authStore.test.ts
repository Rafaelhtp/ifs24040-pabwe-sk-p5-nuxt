import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { postLogin, postLogout, postRegister } from "../api/authApi";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi", () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
  postLogout: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Delcom", email: "a@b.c" };

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("authStore", () => {
  it("should read initial token from storage", () => {
    putAccessToken("saved-token");
    setActivePinia(createPinia());
    const store = useAuthStore();
    expect(store.token).toBe("saved-token");
    expect(store.isAuthenticated).toBe(true);
  });

  it("should not be authenticated without token", () => {
    expect(useAuthStore().isAuthenticated).toBe(false);
  });

  describe("asyncSetIsAuthLogin", () => {
    it("should store token and user on success", async () => {
      (postLogin as any).mockResolvedValue({ status: "success", message: "ok", data: { user, token: "tkn" } });
      const store = useAuthStore();

      const result = await store.asyncSetIsAuthLogin({ email: "a@b.c", password: "123456" });

      expect(result).toBe(true);
      expect(store.token).toBe("tkn");
      expect(store.user).toEqual(user);
      expect(store.isAuthLogin).toBe(false);
      expect(getAccessToken()).toBe("tkn");
    });

    it("should show error dialog on failure", async () => {
      (postLogin as any).mockResolvedValue({ status: "fail", message: "Kredensial salah" });
      const store = useAuthStore();

      const result = await store.asyncSetIsAuthLogin({ email: "a@b.c", password: "x" });

      expect(result).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Kredensial salah");
      expect(store.token).toBeNull();
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("should show success dialog on success", async () => {
      (postRegister as any).mockResolvedValue({ status: "success", message: "Berhasil mendaftar" });
      const store = useAuthStore();

      const result = await store.asyncSetIsAuthRegister({ name: "A", email: "a@b.c", password: "123456" });

      expect(result).toBe(true);
      expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
      expect(store.isAuthRegister).toBe(false);
    });

    it("should show error dialog on failure", async () => {
      (postRegister as any).mockResolvedValue({ status: "fail", message: "Email sudah dipakai" });
      const store = useAuthStore();

      const result = await store.asyncSetIsAuthRegister({ name: "A", email: "a@b.c", password: "123456" });

      expect(result).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    });
  });

  it("asyncSetIsAuthLogout should clear session", async () => {
    putAccessToken("tkn");
    setActivePinia(createPinia());
    (postLogout as any).mockResolvedValue({ status: "success", message: "ok" });
    const store = useAuthStore();
    store.user = user;

    await store.asyncSetIsAuthLogout();

    expect(postLogout).toHaveBeenCalled();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthLogout).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
