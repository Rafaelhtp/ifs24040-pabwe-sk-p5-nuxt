import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";
import { useUsersStore } from "./usersStore";

vi.mock("../api/userApi", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const user = { id: 1, name: "Delcom", email: "a@b.c" };
const ok = { status: "success", message: "Berhasil" };
const fail = { status: "fail", message: "Gagal" };

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("usersStore", () => {
  it("asyncGetUsers should store users on success", async () => {
    (getUsers as any).mockResolvedValue({ ...ok, data: { users: [user] } });
    const store = useUsersStore();
    await expect(store.asyncGetUsers()).resolves.toBe(true);
    expect(store.users).toEqual([user]);
    expect(store.isUsers).toBe(false);
  });

  it("asyncGetUsers should show error on failure", async () => {
    (getUsers as any).mockResolvedValue(fail);
    const store = useUsersStore();
    await expect(store.asyncGetUsers()).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncGetProfile should store profile on success", async () => {
    (getMe as any).mockResolvedValue({ ...ok, data: { user } });
    const store = useUsersStore();
    await expect(store.asyncGetProfile()).resolves.toBe(true);
    expect(store.profile).toEqual(user);
    expect(store.isProfile).toBe(false);
  });

  it("asyncGetProfile should show error on failure", async () => {
    (getMe as any).mockResolvedValue(fail);
    const store = useUsersStore();
    await expect(store.asyncGetProfile()).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    expect(store.profile).toBeNull();
  });

  it("asyncChangeProfile should update profile and show success", async () => {
    (putMe as any).mockResolvedValue({ ...ok, data: { user: { ...user, name: "Baru" } } });
    const store = useUsersStore();
    await expect(store.asyncChangeProfile({ name: "Baru", email: "a@b.c" })).resolves.toBe(true);
    expect(store.profile.name).toBe("Baru");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(store.isProfileChange).toBe(false);
  });

  it("asyncChangeProfile should show error on failure", async () => {
    (putMe as any).mockResolvedValue(fail);
    const store = useUsersStore();
    await expect(store.asyncChangeProfile({ name: "Baru", email: "a@b.c" })).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncChangePhoto should show success", async () => {
    (postPhoto as any).mockResolvedValue(ok);
    const store = useUsersStore();
    await expect(store.asyncChangePhoto(new File(["x"], "a.png"))).resolves.toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(store.isPhotoChange).toBe(false);
  });

  it("asyncChangePhoto should show error on failure", async () => {
    (postPhoto as any).mockResolvedValue(fail);
    const store = useUsersStore();
    await expect(store.asyncChangePhoto(new File(["x"], "a.png"))).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncChangePassword should show success", async () => {
    (putPassword as any).mockResolvedValue(ok);
    const store = useUsersStore();
    const payload = { password: "a", new_password: "b", new_password_confirmation: "b" };
    await expect(store.asyncChangePassword(payload)).resolves.toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(store.isPasswordChange).toBe(false);
  });

  it("asyncChangePassword should show error on failure", async () => {
    (putPassword as any).mockResolvedValue(fail);
    const store = useUsersStore();
    const payload = { password: "a", new_password: "b", new_password_confirmation: "b" };
    await expect(store.asyncChangePassword(payload)).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });
});
