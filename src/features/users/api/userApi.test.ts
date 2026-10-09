import { describe, it, expect, vi, beforeEach } from "vitest";
import { userApi } from "./userApi";
import * as apiHelper from "~/helpers/apiHelper";

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls GET /users", async () => {
    const mockRes = { success: true, data: [{ id: 1, name: "Alice", email: "alice@delcom.org" }] };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const result = await userApi.getUsers();
    expect(result).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/users");
  });

  it("calls GET /users/me", async () => {
    const mockRes = { success: true, data: { id: 1, name: "Alice", email: "alice@delcom.org" } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const result = await userApi.getProfile();
    expect(result).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/users/me");
  });

  it("calls PUT /users/me with payload", async () => {
    const payload = { name: "Alice Renamed" };
    const mockRes = { success: true, data: { id: 1, name: "Alice Renamed", email: "alice@delcom.org" } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const result = await userApi.updateProfile(payload);
    expect(result).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: payload,
    });
  });

  it("calls POST /users/me/photo with FormData", async () => {
    const dummyBlob = new Blob(["dummy content"], { type: "image/png" });
    const mockRes = { success: true, data: { photo: "https://example.com/avatar.png" } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const result = await userApi.uploadPhoto(dummyBlob);
    expect(result).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/users/me/photo", {
      method: "POST",
      body: expect.any(FormData),
    });
  });

  it("calls PUT /users/me/password with payload", async () => {
    const payload = { current_password: "old", password: "new", confirm_password: "new" };
    const mockRes = { success: true, message: "Password updated", data: null };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const result = await userApi.changePassword(payload);
    expect(result).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: payload,
    });
  });
});
