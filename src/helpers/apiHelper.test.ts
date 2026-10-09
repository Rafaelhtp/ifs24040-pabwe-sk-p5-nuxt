import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getAccessToken, putAccessToken, fetchWithAuth } from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("token storage", () => {
    it("should store and retrieve access token", () => {
      expect(getAccessToken()).toBeNull();
      putAccessToken("test-token-123");
      expect(getAccessToken()).toBe("test-token-123");
      putAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error("Storage blocked");
      });
      expect(getAccessToken()).toBeNull();
      localStorage.getItem = originalGetItem;

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage blocked");
      });
      expect(() => putAccessToken("token")).not.toThrow();
      localStorage.setItem = originalSetItem;
    });
  });

  describe("fetchWithAuth", () => {
    it("should make a basic GET request with DELCOM_BASEURL", async () => {
      const mockData = { success: true, data: [] };
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      } as any);

      const result = await fetchWithAuth("/test-endpoint");
      expect(result).toEqual(mockData);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/test-endpoint",
        expect.objectContaining({
          headers: {},
        })
      );
    });

    it("should fallback to default baseUrl if DELCOM_BASEURL is undefined", async () => {
      const original = (globalThis as any).DELCOM_BASEURL;
      delete (globalThis as any).DELCOM_BASEURL;
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ ok: true }),
      } as any);

      await fetchWithAuth("/default-url");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/default-url",
        expect.any(Object)
      );
      (globalThis as any).DELCOM_BASEURL = original;
    });

    it("should attach Authorization header when token exists", async () => {
      putAccessToken("my-jwt-token");
      const mockData = { ok: true };
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      } as any);

      await fetchWithAuth("users/me");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/users/me",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer my-jwt-token",
          },
        })
      );
    });

    it("should handle query params correctly", async () => {
      const mockData = { items: [] };
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      } as any);

      await fetchWithAuth("/cash-flows", {
        params: {
          type: "inflow",
          limit: 10,
          empty: "",
          nullVal: null,
          undefVal: undefined,
        },
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/cash-flows?type=inflow&limit=10",
        expect.any(Object)
      );
    });

    it("should handle query params when endpoint already has query params", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({}),
      } as any);

      await fetchWithAuth("/search?active=true", {
        params: { page: 2 },
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/search?active=true&page=2",
        expect.any(Object)
      );
    });

    it("should stringify object body and set content-type header", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true }),
      } as any);

      await fetchWithAuth("/login", {
        method: "POST",
        body: { email: "test@delcom.org", password: "secret" } as any,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "test@delcom.org", password: "secret" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should support FormData body without overriding Content-Type", async () => {
      const formData = new FormData();
      formData.append("file", "dummy");

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true }),
      } as any);

      await fetchWithAuth("/upload", {
        method: "POST",
        body: formData,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://open-api.delcom.org/api/v1/upload",
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });

    it("should parse text response when content-type is not JSON", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => "OK",
      } as any);

      const result = await fetchWithAuth("/health");
      expect(result).toBe("OK");
    });

    it("should throw error with message when response is not ok", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ message: "Email already taken" }),
      } as any);

      await expect(fetchWithAuth("/register")).rejects.toThrow("Email already taken");
    });

    it("should throw error with fallback message when no message field", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "text/plain" }),
        text: async () => "Internal error",
      } as any);

      await expect(fetchWithAuth("/crash")).rejects.toThrow(
        "Request failed with status 500"
      );
    });

    it("should fallback to error property in response when message is absent", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Not found" }),
      } as any);

      await expect(fetchWithAuth("/not-found")).rejects.toThrow("Not found");
    });
  });
});
