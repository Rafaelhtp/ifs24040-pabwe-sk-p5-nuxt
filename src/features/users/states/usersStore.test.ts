import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUsersStore } from "./usersStore";
import { userApi } from "../api/userApi";

describe("usersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("initializes with default state", () => {
    const store = useUsersStore();
    expect(store.users).toEqual([]);
    expect(store.profile).toBeNull();
    expect(store.isLoadingUsers).toBe(false);
    expect(store.isLoadingProfile).toBe(false);
    expect(store.isUpdatingProfile).toBe(false);
    expect(store.isUploadingPhoto).toBe(false);
    expect(store.isChangingPassword).toBe(false);
  });

  describe("asyncGetUsers", () => {
    it("fetches and stores users list", async () => {
      const store = useUsersStore();
      const mockUsers = [
        { id: 1, name: "Alice", email: "alice@delcom.org" },
        { id: 2, name: "Bob", email: "bob@delcom.org" },
      ];
      vi.spyOn(userApi, "getUsers").mockResolvedValueOnce({
        success: true,
        data: mockUsers,
      });

      const res = await store.asyncGetUsers();
      expect(res).toEqual(mockUsers);
      expect(store.users).toEqual(mockUsers);
      expect(store.isLoadingUsers).toBe(false);
    });

    it("handles empty data fallback", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUsers").mockResolvedValueOnce({
        success: true,
        data: null as any,
      });

      const res = await store.asyncGetUsers();
      expect(res).toEqual([]);
      expect(store.users).toEqual([]);
    });

    it("handles error during fetching users", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUsers").mockRejectedValueOnce(new Error("Network error"));

      await expect(store.asyncGetUsers()).rejects.toThrow("Network error");
      expect(store.isLoadingUsers).toBe(false);
    });
  });

  describe("asyncGetProfile", () => {
    it("fetches and sets user profile", async () => {
      const store = useUsersStore();
      const profile = { id: 1, name: "Alice", email: "alice@delcom.org" };
      vi.spyOn(userApi, "getProfile").mockResolvedValueOnce({
        success: true,
        data: profile,
      });

      const res = await store.asyncGetProfile();
      expect(res).toEqual(profile);
      expect(store.profile).toEqual(profile);
      expect(store.isLoadingProfile).toBe(false);
    });

    it("handles empty profile data fallback", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getProfile").mockResolvedValueOnce({
        success: true,
        data: null as any,
      });

      const res = await store.asyncGetProfile();
      expect(res).toBeNull();
      expect(store.profile).toBeNull();
    });

    it("handles error during fetching profile", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getProfile").mockRejectedValueOnce(new Error("Auth failed"));

      await expect(store.asyncGetProfile()).rejects.toThrow("Auth failed");
      expect(store.isLoadingProfile).toBe(false);
    });
  });

  describe("asyncUpdateProfile", () => {
    it("updates user profile name and updates state", async () => {
      const store = useUsersStore();
      store.profile = { id: 1, name: "Old", email: "old@delcom.org" };
      const updated = { id: 1, name: "New Name", email: "old@delcom.org" };

      vi.spyOn(userApi, "updateProfile").mockResolvedValueOnce({
        success: true,
        data: updated,
      });

      const res = await store.asyncUpdateProfile({ name: "New Name" });
      expect(res).toEqual(updated);
      expect(store.profile?.name).toBe("New Name");
      expect(store.isUpdatingProfile).toBe(false);
    });

    it("updates user profile when current profile is null", async () => {
      const store = useUsersStore();
      store.profile = null;
      const updated = { id: 1, name: "New Name", email: "new@delcom.org" };

      vi.spyOn(userApi, "updateProfile").mockResolvedValueOnce({
        success: true,
        data: updated,
      });

      const res = await store.asyncUpdateProfile({ name: "New Name" });
      expect(res).toEqual(updated);
      expect(store.profile).toEqual(updated);
    });

    it("handles asyncUpdateProfile when response.data is null", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "updateProfile").mockResolvedValueOnce({
        success: true,
        data: null as any,
      });

      const res = await store.asyncUpdateProfile({ name: "Null test" });
      expect(res).toBeNull();
    });

    it("handles update error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "updateProfile").mockRejectedValueOnce(new Error("Update failed"));

      await expect(store.asyncUpdateProfile({ name: "Err" })).rejects.toThrow("Update failed");
      expect(store.isUpdatingProfile).toBe(false);
    });
  });

  describe("asyncUploadPhoto", () => {
    it("uploads photo and updates profile avatar", async () => {
      const store = useUsersStore();
      store.profile = { id: 1, name: "User", email: "user@delcom.org" };
      const dummyFile = new Blob(["image"]);

      vi.spyOn(userApi, "uploadPhoto").mockResolvedValueOnce({
        success: true,
        data: { photo: "https://example.com/avatar.jpg" },
      });

      const photoUrl = await store.asyncUploadPhoto(dummyFile);
      expect(photoUrl).toBe("https://example.com/avatar.jpg");
      expect(store.profile?.photo).toBe("https://example.com/avatar.jpg");
      expect(store.isUploadingPhoto).toBe(false);
    });

    it("handles error during photo upload", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "uploadPhoto").mockRejectedValueOnce(new Error("Upload failed"));

      await expect(store.asyncUploadPhoto(new Blob())).rejects.toThrow("Upload failed");
      expect(store.isUploadingPhoto).toBe(false);
    });
  });

  describe("asyncChangePassword", () => {
    it("changes password successfully", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "changePassword").mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await store.asyncChangePassword({
        current_password: "old",
        password: "new",
      });
      expect(store.isChangingPassword).toBe(false);
    });

    it("handles password change error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "changePassword").mockRejectedValueOnce(new Error("Old password wrong"));

      await expect(
        store.asyncChangePassword({ current_password: "wrong", password: "new" })
      ).rejects.toThrow("Old password wrong");
      expect(store.isChangingPassword).toBe(false);
    });
  });
});
