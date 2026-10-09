import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "./authApi";
import * as apiHelper from "~/helpers/apiHelper";

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls /auth/login with POST method and payload", async () => {
    const payload = { email: "test@delcom.org", password: "password123" };
    const mockResponse = {
      success: true,
      data: { token: "token-123", user: { id: 1, name: "Test User", email: "test@delcom.org" } },
    };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockResponse as any);

    const result = await authApi.login(payload);
    expect(result).toEqual(mockResponse);
    expect(fetchSpy).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: payload,
    });
  });

  it("calls /auth/register with POST method and payload", async () => {
    const payload = {
      name: "New User",
      email: "new@delcom.org",
      password: "password123",
    };
    const mockResponse = {
      success: true,
      data: { token: "token-xyz" },
    };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockResponse as any);

    const result = await authApi.register(payload);
    expect(result).toEqual(mockResponse);
    expect(fetchSpy).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: payload,
    });
  });
});
