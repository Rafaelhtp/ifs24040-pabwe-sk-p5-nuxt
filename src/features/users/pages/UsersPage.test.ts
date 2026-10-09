import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
import { useUsersStore } from "../states/usersStore";
import * as toolsHelper from "~/helpers/toolsHelper";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders page header and calls asyncGetUsers on mount", async () => {
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    const spy = vi.spyOn(store, "asyncGetUsers").mockResolvedValueOnce([
      { id: 1, name: "Alice", email: "alice@delcom.org", photo: "https://example.com/a.jpg" },
      { id: 2, name: "", email: "bob@delcom.org" },
    ]);

    const wrapper = renderWithProviders(UsersPage, { pinia });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Direktori Pengguna");
    expect(spy).toHaveBeenCalled();
  });

  it("shows loading indicator when isLoadingUsers is true", () => {
    const wrapper = renderWithProviders(UsersPage, {
      initialState: {
        users: {
          users: [],
          isLoadingUsers: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='users-loading']").exists()).toBe(true);
  });

  it("shows empty state when users array is empty", async () => {
    const wrapper = renderWithProviders(UsersPage, {
      initialState: {
        users: {
          users: [],
          isLoadingUsers: false,
        },
      },
    });

    expect(wrapper.find("[data-testid='users-empty']").exists()).toBe(true);
    expect(wrapper.text()).toContain("Belum ada data pengguna lain.");
  });

  it("renders user cards correctly when users are populated", async () => {
    const wrapper = renderWithProviders(UsersPage, {
      initialState: {
        users: {
          users: [
            { id: 1, name: "Alice", email: "alice@delcom.org", photo: "https://photo.com/alice.jpg" },
            { id: 2, name: "Bob", email: "bob@delcom.org", photo: null },
            { id: 3, name: "", email: "anonymous@delcom.org", photo: null },
          ],
          isLoadingUsers: false,
        },
      },
    });

    const cards = wrapper.findAll("[data-testid='user-card']");
    expect(cards).toHaveLength(3);
    expect(cards[0].find("[data-testid='user-name']").text()).toBe("Alice");
    expect(cards[0].find("[data-testid='user-photo']").exists()).toBe(true);
    expect(cards[1].find("[data-testid='user-name']").text()).toBe("Bob");
  });

  it("handles error in loadUsers and shows dialog", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetUsers").mockRejectedValue(new Error("Gagal mengambil data"));

    const wrapper = renderWithProviders(UsersPage, { pinia });
    await wrapper.find("[data-testid='btn-refresh-users']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Pengguna", "Gagal mengambil data");
  });

  it("handles error in loadUsers without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useUsersStore(pinia);
    vi.spyOn(store, "asyncGetUsers").mockRejectedValue({});

    const wrapper = renderWithProviders(UsersPage, { pinia });
    await wrapper.find("[data-testid='btn-refresh-users']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Pengguna", "Tidak dapat memuat daftar pengguna.");
  });
});
