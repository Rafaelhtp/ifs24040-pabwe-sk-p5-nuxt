import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders, createMockPinia, createMockRouter } from "~/test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import * as toolsHelper from "~/helpers/toolsHelper";
import type { CashFlow } from "../api/cashFlowApi";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

const mockCashFlow: CashFlow = {
  id: "cf-101",
  type: "inflow",
  source: "savings",
  label: "Dividen Saham",
  nominal: 1250000,
  description: "Dividen tahunan",
  created_at: "2026-03-01T10:00:00Z",
  updated_at: "2026-03-02T10:00:00Z",
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders transaction details when cashFlow is populated", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: "/cash-flows/cf-101",
    });

    expect(wrapper.find("[data-testid='detail-label']").text()).toBe("Dividen Saham");
    expect(wrapper.find("[data-testid='detail-nominal']").text()).toContain("1250000");
    expect(wrapper.find("[data-testid='detail-source']").text()).toBe("savings");
    expect(wrapper.find("[data-testid='detail-badge']").text()).toContain("Uang Masuk (Inflow)");
    expect(wrapper.find("[data-testid='detail-description']").text()).toBe("Dividen tahunan");
    expect(wrapper.find("[data-testid='detail-updated-at']").exists()).toBe(true);
  });

  it("renders fallback description and outflow badge", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlow = {
      ...mockCashFlow,
      type: "outflow",
      description: "",
      updated_at: undefined,
    };

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: "/cash-flows/cf-101",
    });

    expect(wrapper.find("[data-testid='detail-badge']").text()).toContain("Uang Keluar (Outflow)");
    expect(wrapper.find("[data-testid='detail-description']").text()).toBe("Tidak ada deskripsi tambahan.");
    expect(wrapper.find("[data-testid='detail-updated-at']").exists()).toBe(false);
  });

  it("renders loading state when isLoadingCashFlow is true", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.isLoadingCashFlow = true;

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: "/cash-flows/cf-101",
    });

    expect(wrapper.find("[data-testid='detail-loading']").exists()).toBe(true);
  });

  it("renders not found state when cashFlow is null", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlow = null;
    store.isLoadingCashFlow = false;

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: "/cash-flows/cf-999",
    });

    expect(wrapper.find("[data-testid='detail-not-found']").exists()).toBe(true);
  });

  it("opens edit modal when edit button clicked", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      initialRoute: "/cash-flows/cf-101",
    });

    await wrapper.find("[data-testid='btn-detail-edit']").trigger("click");
    expect(wrapper.vm.isChangeModalOpen).toBe(true);

    // Close change modal via cancel button inside ChangeModal
    await wrapper.find("[data-testid='btn-cancel-change']").trigger("click");
    expect(wrapper.vm.isChangeModalOpen).toBe(false);
  });

  it("deletes transaction with confirmation and navigates home", async () => {
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;
    const deleteSpy = vi.spyOn(store, "asyncDeleteCashFlow").mockResolvedValue();

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-detail-delete']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith("cf-101");
    expect(successSpy).toHaveBeenCalled();
  });

  it("cancels deletion when user clicks cancel", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;
    const deleteSpy = vi.spyOn(store, "asyncDeleteCashFlow");

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-detail-delete']").trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("handles deletion error", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;
    vi.spyOn(store, "asyncDeleteCashFlow").mockRejectedValue(new Error("Gagal hapus detail"));

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-detail-delete']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menghapus", "Gagal hapus detail");
  });

  it("handles deletion error without message", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;
    vi.spyOn(store, "asyncDeleteCashFlow").mockRejectedValue({});

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-detail-delete']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menghapus", "Terjadi kesalahan saat menghapus data.");
  });

  it("handles loadDetail error gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-error");

    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlowById").mockRejectedValue(new Error("ID not found"));

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Detail", "ID not found");
  });

  it("handles loadDetail error without message gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-error");

    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlowById").mockRejectedValue({});

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Detail", "Data transaksi tidak ditemukan.");
  });

  it("handles ChangeModal close and success callbacks in DetailPage", async () => {
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;
    const getSpy = vi.spyOn(store, "asyncGetCashFlowById").mockResolvedValue(mockCashFlow);

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-detail-edit']").trigger("click");
    expect(wrapper.vm.isChangeModalOpen).toBe(true);

    const changeModal = wrapper.findComponent({ name: "ChangeModal" });
    // Call onClose prop
    changeModal.props("onClose")();
    expect(wrapper.vm.isChangeModalOpen).toBe(false);

    // Call onSuccess prop
    changeModal.props("onSuccess")();
    expect(getSpy).toHaveBeenCalled();
  });

  it("navigates back home when back button is clicked", async () => {
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/cash-flows/cf-101");

    const store = useCashFlowsStore(pinia);
    store.cashFlow = mockCashFlow;

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    await wrapper.find("[data-testid='btn-back']").trigger("click");
  });

  it("does not loadDetail or handleDelete if cashFlowId route param is missing", async () => {
    const pinia = createMockPinia();
    const router = createMockRouter();
    await router.push("/");

    const store = useCashFlowsStore(pinia);
    const getSpy = vi.spyOn(store, "asyncGetCashFlowById");

    const wrapper = renderWithProviders(DetailPage, {
      pinia,
      router,
    });
    await wrapper.vm.$nextTick();

    expect(getSpy).not.toHaveBeenCalled();

    // Call handleDelete when id is empty
    await wrapper.vm.handleDelete();
    expect(store.isCashFlowDelete).toBe(false);
  });
});
