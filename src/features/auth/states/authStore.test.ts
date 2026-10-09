import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";
import { authApi } from "../api/authApi";
import * as apiHelper from "~/helpers/apiHelper";

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("initializes with default state", () => {
    const store = useAuthStore();
    expect(store.isAuthLogin).toBe(false);
    expect(store.isAuthRegister).toBe(false);
    expect(store.isAuthLogout).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
  });

  describe("asyncLogin", () => {
    it("handles successful login and stores token", async () => {
      const store = useAuthStore();
      const mockResponse = {
        success: true,
        data: {
          token: "jwt-token-123",
          user: { id: 1, name: "Test User", email: "user@delcom.org" },
        },
      };
      vi.spyOn(authApi, "login").mockResolvedValueOnce(mockResponse as any);
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");

      const success = await store.asyncLogin({
        email: "user@delcom.org",
        password: "password",
      });

      expect(success).toBe(true);
      expect(store.token).toBe("jwt-token-123");
      expect(store.user).toEqual(mockResponse.data.user);
      expect(store.isAuthLogin).toBe(false);
      expect(putTokenSpy).toHaveBeenCalledWith("jwt-token-123");
    });

    it("handles login failure and resets loading state", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "login").mockRejectedValueOnce(new Error("Invalid credentials"));

      await expect(
        store.asyncLogin({ email: "wrong@delcom.org", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");

      expect(store.isAuthLogin).toBe(false);
      expect(store.token).toBeNull();
    });

    it("handles response without token/user gracefully", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "login").mockResolvedValueOnce({
        success: true,
        data: {},
      } as any);

      await store.asyncLogin({ email: "user@delcom.org", password: "pwd" });
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
    });
  });

  describe("asyncRegister", () => {
    it("handles successful registration", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "register").mockResolvedValueOnce({
        success: true,
        data: {},
      } as any);

      const success = await store.asyncRegister({
        name: "New",
        email: "new@delcom.org",
        password: "secret",
      });

      expect(success).toBe(true);
      expect(store.isAuthRegister).toBe(false);
    });

    it("handles registration failure", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "register").mockRejectedValueOnce(new Error("Email already registered"));

      await expect(
        store.asyncRegister({
          name: "New",
          email: "new@delcom.org",
          password: "secret",
        })
      ).rejects.toThrow("Email already registered");

      expect(store.isAuthRegister).toBe(false);
    });
  });

  describe("asyncLogout", () => {
    it("logs out, clears token, and clears user", async () => {
      const store = useAuthStore();
      store.token = "active-token";
      store.user = { id: 1, name: "Name", email: "test@mail.com" };
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken");

      await store.asyncLogout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthLogout).toBe(false);
      expect(putTokenSpy).toHaveBeenCalledWith(null);
    });
  });

  describe("setUser", () => {
    it("sets user object", () => {
      const store = useAuthStore();
      store.setUser({ id: 99, name: "Manual", email: "manual@delcom.org" });
      expect(store.user?.name).toBe("Manual");
      store.setUser(null);
      expect(store.user).toBeNull();
    });
  });
});
