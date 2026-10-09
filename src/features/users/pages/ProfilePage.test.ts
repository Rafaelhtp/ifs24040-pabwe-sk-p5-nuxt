import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
import { useUsersStore } from "../states/usersStore";
import { useAuthStore } from "~/features/auth/states/authStore";
import * as toolsHelper from "~/helpers/toolsHelper";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders profile info and initializes name input", async () => {
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetProfile").mockResolvedValueOnce({
      id: 1,
      name: "Rafael Nobel",
      email: "rafael@delcom.org",
      photo: "https://example.com/photo.png",
    });

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("shows fallback avatar letter if photo is null or undefined", async () => {
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetProfile").mockResolvedValueOnce({
      id: 1,
      name: "",
      email: "test@delcom.org",
      photo: null as any,
    });

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    expect(wrapper.find("[data-testid='profile-avatar-fallback']").text()).toBe("U");
  });

  it("shows fallback text for name and email when profile is null", async () => {
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    store.profile = null;
    vi.spyOn(store, "asyncGetProfile").mockResolvedValueOnce(null as any);

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(wrapper.find("[data-testid='profile-display-name']").text()).toBe("Pengguna");
    expect(wrapper.find("[data-testid='profile-display-email']").text()).toBe("-");
    expect((wrapper.find("[data-testid='input-profile-email-disabled']").element as HTMLInputElement).value).toBe("");
  });

  it("shows first letter of name in avatar fallback when photo is missing but name exists", async () => {
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const mockUserData = {
      id: 1,
      name: "Budi Santoso",
      email: "budi@delcom.org",
      photo: null as any,
    };
    vi.spyOn(store, "asyncGetProfile").mockImplementation(async () => {
      store.profile = mockUserData;
      return mockUserData;
    });

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(wrapper.find("[data-testid='profile-avatar-fallback']").text()).toBe("B");
    expect((wrapper.find("[data-testid='input-profile-email-disabled']").element as HTMLInputElement).value).toBe("budi@delcom.org");
  });

  it("handles profile loading error gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetProfile").mockRejectedValue(new Error("Gagal load profile"));

    renderWithProviders(ProfilePage, { pinia });
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Profil", "Gagal load profile");
  });

  it("handles profile loading error without message gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetProfile").mockRejectedValue({});

    renderWithProviders(ProfilePage, { pinia });
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Profil", "Tidak dapat memuat profil pengguna.");
  });

  it("validates and updates profile name", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = { id: 1, name: "Old", email: "old@delcom.org" };

    const wrapper = renderWithProviders(ProfilePage, { pinia });

    // Empty name validation
    await wrapper.find("[data-testid='input-profile-name']").setValue("   ");
    await wrapper.find("[data-testid='form-update-profile']").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Nama tidak boleh kosong.");

    // Successful update
    const updateSpy = vi.spyOn(store, "asyncUpdateProfile").mockResolvedValueOnce({
      id: 1,
      name: "Rafael Nobel H",
      email: "old@delcom.org",
    });

    await wrapper.find("[data-testid='input-profile-name']").setValue("Rafael Nobel H");
    await wrapper.find("[data-testid='form-update-profile']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(updateSpy).toHaveBeenCalledWith({ name: "Rafael Nobel H" });
    expect(authStore.user?.name).toBe("Rafael Nobel H");
    expect(successSpy).toHaveBeenCalledWith("Profil Diperbarui", "Nama pengguna berhasil disimpan.");
  });

  it("updates profile when authStore.user is null", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = null;

    vi.spyOn(store, "asyncUpdateProfile").mockResolvedValueOnce({
      id: 1,
      name: "No Auth User",
      email: "test@delcom.org",
    });

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.find("[data-testid='input-profile-name']").setValue("No Auth User");
    await wrapper.find("[data-testid='form-update-profile']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(successSpy).toHaveBeenCalled();
  });

  it("handles error when updating profile", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncUpdateProfile").mockRejectedValue(new Error("Server error"));

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.find("[data-testid='input-profile-name']").setValue("New Name");
    await wrapper.find("[data-testid='form-update-profile']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memperbarui Profil", "Server error");
  });

  it("handles error when updating profile without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncUpdateProfile").mockRejectedValue({});

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.find("[data-testid='input-profile-name']").setValue("New Name");
    await wrapper.find("[data-testid='form-update-profile']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memperbarui Profil", "Terjadi kesalahan.");
  });

  it("handles avatar upload triggering and file selection", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = { id: 1, name: "Name", email: "mail@delcom.org" };

    const uploadSpy = vi.spyOn(store, "asyncUploadPhoto").mockResolvedValueOnce("https://new.com/avatar.jpg");

    const wrapper = renderWithProviders(ProfilePage, { pinia });

    // Trigger file input click
    const fileInput = wrapper.find<HTMLInputElement>("[data-testid='file-avatar-input']");
    const clickSpy = vi.spyOn(fileInput.element, "click");
    await wrapper.find("[data-testid='btn-upload-avatar']").trigger("click");
    expect(clickSpy).toHaveBeenCalled();

    // Trigger file change with empty files
    await fileInput.trigger("change");
    expect(uploadSpy).not.toHaveBeenCalled();

    // Trigger file change with file
    const file = new File(["dummy"], "avatar.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: true,
    });
    await fileInput.trigger("change");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(uploadSpy).toHaveBeenCalledWith(file);
    expect(authStore.user?.avatar).toBe("https://new.com/avatar.jpg");
    expect(successSpy).toHaveBeenCalledWith("Foto Diperbarui", "Foto profil berhasil diunggah.");
  });

  it("handles avatar upload when authStore.user is null", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const authStore = useAuthStore(pinia);
    authStore.user = null;

    const uploadSpy = vi.spyOn(store, "asyncUploadPhoto").mockResolvedValueOnce("https://new.com/avatar.jpg");

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    const fileInput = wrapper.find<HTMLInputElement>("[data-testid='file-avatar-input']");
    const file = new File(["dummy"], "avatar.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: true,
    });
    await fileInput.trigger("change");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(uploadSpy).toHaveBeenCalledWith(file);
    expect(authStore.user).toBeNull();
    expect(successSpy).toHaveBeenCalledWith("Foto Diperbarui", "Foto profil berhasil diunggah.");
  });

  it("handles avatar upload failure", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncUploadPhoto").mockRejectedValue(new Error("File too large"));

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    const fileInput = wrapper.find<HTMLInputElement>("[data-testid='file-avatar-input']");
    const file = new File(["dummy"], "avatar.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: true,
    });
    await fileInput.trigger("change");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Mengunggah Foto", "File too large");
  });

  it("handles avatar upload failure without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncUploadPhoto").mockRejectedValue({});

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    const fileInput = wrapper.find<HTMLInputElement>("[data-testid='file-avatar-input']");
    const file = new File(["dummy"], "avatar.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: true,
    });
    await fileInput.trigger("change");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Mengunggah Foto", "Tidak dapat mengunggah foto.");
  });

  it("validates and changes password successfully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);

    const wrapper = renderWithProviders(ProfilePage, { pinia });

    // Empty fields
    await wrapper.find("[data-testid='form-change-password']").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Semua kolom kata sandi harus diisi.");

    // Mismatched new password
    await wrapper.find("[data-testid='input-current-password']").setValue("old123");
    await wrapper.find("[data-testid='input-new-password']").setValue("newpass");
    await wrapper.find("[data-testid='input-confirm-new-password']").setValue("different");
    await wrapper.find("[data-testid='form-change-password']").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Konfirmasi kata sandi baru tidak cocok.");

    // Valid submission
    const changeSpy = vi.spyOn(store, "asyncChangePassword").mockResolvedValueOnce();
    await wrapper.find("[data-testid='input-confirm-new-password']").setValue("newpass");
    await wrapper.find("[data-testid='form-change-password']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(changeSpy).toHaveBeenCalledWith({
      current_password: "old123",
      password: "newpass",
      confirm_password: "newpass",
    });
    expect(successSpy).toHaveBeenCalledWith(
      "Kata Sandi Berhasil Diubah",
      "Silakan gunakan kata sandi baru Anda saat login."
    );
  });

  it("handles change password error", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncChangePassword").mockRejectedValue(new Error("Kata sandi lama keliru"));

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.find("[data-testid='input-current-password']").setValue("wrong");
    await wrapper.find("[data-testid='input-new-password']").setValue("new123");
    await wrapper.find("[data-testid='input-confirm-new-password']").setValue("new123");
    await wrapper.find("[data-testid='form-change-password']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Mengubah Kata Sandi", "Kata sandi lama keliru");
  });

  it("handles change password error without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncChangePassword").mockRejectedValue({});

    const wrapper = renderWithProviders(ProfilePage, { pinia });
    await wrapper.find("[data-testid='input-current-password']").setValue("wrong");
    await wrapper.find("[data-testid='input-new-password']").setValue("new123");
    await wrapper.find("[data-testid='input-confirm-new-password']").setValue("new123");
    await wrapper.find("[data-testid='form-change-password']").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith(
      "Gagal Mengubah Kata Sandi",
      "Kata sandi lama salah atau tidak valid."
    );
  });

  it("displays loading label when isUpdatingProfile and isChangingPassword are true", () => {
    const wrapper = renderWithProviders(ProfilePage, {
      initialState: {
        users: {
          isUpdatingProfile: true,
          isChangingPassword: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='btn-save-profile']").text()).toContain("Menyimpan...");
    expect(wrapper.find("[data-testid='btn-save-password']").text()).toContain("Mengubah...");
  });
});
