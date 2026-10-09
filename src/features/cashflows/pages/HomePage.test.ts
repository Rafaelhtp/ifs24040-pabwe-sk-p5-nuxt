import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
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

const mockTransactions: CashFlow[] = [
  {
    id: "cf-1",
    type: "inflow",
    source: "cash",
    label: "Gaji Pokok",
    nominal: 5000000,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "cf-2",
    type: "outflow",
    source: "savings",
    label: "Sewa Kos",
    nominal: 1200000,
    created_at: "2026-03-02T00:00:00Z",
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true as any);
  });

  it("renders page header and metric cards", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.stats = {
      total_inflow: 5000000,
      total_outflow: 1200000,
      net_balance: 3800000,
      cash_balance: 5000000,
      savings_balance: -1200000,
      loans_balance: 0,
    };

    const wrapper = renderWithProviders(HomePage, { pinia });
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.find("[data-testid='card-net-balance']").text()).toContain("3800000");
    expect(wrapper.find("[data-testid='card-inflow']").text()).toContain("5000000");
    expect(wrapper.find("[data-testid='card-outflow']").text()).toContain("1200000");
  });

  it("renders metric cards with negative net balance", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.stats = {
      total_inflow: 100000,
      total_outflow: 500000,
      net_balance: -400000,
      cash_balance: 0,
      savings_balance: 0,
      loans_balance: 0,
    };

    const wrapper = renderWithProviders(HomePage, { pinia });
    expect(wrapper.find("[data-testid='card-net-balance']").classes()).toContain("text-rose-400");
  });

  it("shows loading state when isLoadingCashFlows is true", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.isLoadingCashFlows = true;

    const wrapper = renderWithProviders(HomePage, { pinia });
    expect(wrapper.find("[data-testid='table-loading']").exists()).toBe(true);
  });

  it("shows empty state when cash flows array is empty", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = [];
    store.isLoadingCashFlows = false;

    const wrapper = renderWithProviders(HomePage, { pinia });
    expect(wrapper.find("[data-testid='table-empty']").exists()).toBe(true);
  });

  it("renders transaction table with correct badges and rows", () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    store.isLoadingCashFlows = false;

    const wrapper = renderWithProviders(HomePage, { pinia });
    const rows = wrapper.findAll("[data-testid='transaction-row']");
    expect(rows).toHaveLength(2);

    expect(rows[0].find("[data-testid='row-label']").text()).toBe("Gaji Pokok");
    expect(rows[0].find("[data-testid='row-badge']").text()).toBe("+ Inflow");
    expect(rows[1].find("[data-testid='row-badge']").text()).toBe("- Outflow");
  });

  it("triggers filter changes and reloads data", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const getSpy = vi.spyOn(store, "asyncGetCashFlows").mockResolvedValue([]);

    const wrapper = renderWithProviders(HomePage, { pinia });

    await wrapper.find("[data-testid='filter-type']").setValue("inflow");
    await wrapper.find("[data-testid='filter-source']").setValue("cash");
    await wrapper.find("[data-testid='filter-label']").setValue("Gaji");
    await wrapper.find("[data-testid='filter-start-date']").setValue("2026-03-01");
    await wrapper.find("[data-testid='filter-end-date']").setValue("2026-03-31");

    expect(getSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "inflow",
        source: "cash",
        label: "Gaji",
        start_date: "2026-03-01",
        end_date: "2026-03-31",
      })
    );

    // Reset filters
    await wrapper.find("[data-testid='btn-reset-filters']").trigger("click");
    expect(getSpy).toHaveBeenCalledWith({});
  });

  it("tests individual filters separately", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const getSpy = vi.spyOn(store, "asyncGetCashFlows").mockResolvedValue([]);

    const wrapper = renderWithProviders(HomePage, { pinia });

    // Just type
    await wrapper.find("[data-testid='filter-type']").setValue("outflow");
    expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "outflow" }));

    await wrapper.find("[data-testid='btn-reset-filters']").trigger("click");

    // Just source
    await wrapper.find("[data-testid='filter-source']").setValue("savings");
    expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({ source: "savings" }));

    await wrapper.find("[data-testid='btn-reset-filters']").trigger("click");

    // Just label
    await wrapper.find("[data-testid='filter-label']").setValue("Bonus");
    expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({ label: "Bonus" }));

    await wrapper.find("[data-testid='btn-reset-filters']").trigger("click");

    // Just start date
    await wrapper.find("[data-testid='filter-start-date']").setValue("2026-01-01");
    expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({ start_date: "2026-01-01" }));

    await wrapper.find("[data-testid='btn-reset-filters']").trigger("click");

    // Just end date
    await wrapper.find("[data-testid='filter-end-date']").setValue("2026-12-31");
    expect(getSpy).toHaveBeenCalledWith(expect.objectContaining({ end_date: "2026-12-31" }));
  });

  it("opens add modal and change modal", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockImplementation(async () => {
      store.cashFlows = mockTransactions;
      return mockTransactions;
    });

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    await wrapper.find("[data-testid='btn-add-transaction']").trigger("click");
    expect(wrapper.find("[data-testid='add-modal']").exists()).toBe(true);

    // Close add modal via cancel
    await wrapper.find("[data-testid='btn-cancel-add']").trigger("click");
    expect(wrapper.vm.isAddModalOpen).toBe(false);

    const editBtn = wrapper.findAll("[data-testid='btn-action-edit']")[0];
    await editBtn.trigger("click");
    expect(wrapper.find("[data-testid='change-modal']").exists()).toBe(true);

    // Close change modal via cancel
    await wrapper.find("[data-testid='btn-cancel-change']").trigger("click");
    expect(wrapper.vm.isChangeModalOpen).toBe(false);

    // Trigger onClose and onSuccess props of AddModal and ChangeModal
    const addModal = wrapper.findComponent({ name: "AddModal" });
    addModal.props("onClose")();
    addModal.props("onSuccess")();
    const changeModal = wrapper.findComponent({ name: "ChangeModal" });
    changeModal.props("onClose")();
    changeModal.props("onSuccess")();
  });

  it("navigates to detail page when view detail button clicked", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockImplementation(async () => {
      store.cashFlows = mockTransactions;
      return mockTransactions;
    });

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    const detailBtn = wrapper.findAll("[data-testid='btn-action-detail']")[0];
    await detailBtn.trigger("click");
  });

  it("deletes a transaction with confirmation", async () => {
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    const deleteSpy = vi.spyOn(store, "asyncDeleteCashFlow").mockResolvedValue();

    const wrapper = renderWithProviders(HomePage, { pinia });
    const deleteBtn = wrapper.findAll("[data-testid='btn-action-delete']")[0];
    await deleteBtn.trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith("cf-1");
    expect(successSpy).toHaveBeenCalled();
  });

  it("cancels transaction deletion", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    const deleteSpy = vi.spyOn(store, "asyncDeleteCashFlow");

    const wrapper = renderWithProviders(HomePage, { pinia });
    const deleteBtn = wrapper.findAll("[data-testid='btn-action-delete']")[0];
    await deleteBtn.trigger("click");

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("handles deletion error", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    vi.spyOn(store, "asyncDeleteCashFlow").mockRejectedValue(new Error("Cannot delete"));

    const wrapper = renderWithProviders(HomePage, { pinia });
    const deleteBtn = wrapper.findAll("[data-testid='btn-action-delete']")[0];
    await deleteBtn.trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menghapus", "Cannot delete");
  });

  it("handles deletion error without message", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    vi.spyOn(store, "asyncDeleteCashFlow").mockRejectedValue({});

    const wrapper = renderWithProviders(HomePage, { pinia });
    const deleteBtn = wrapper.findAll("[data-testid='btn-action-delete']")[0];
    await deleteBtn.trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menghapus", "Terjadi kesalahan saat menghapus data.");
  });

  it("resets all transactions with confirmation", async () => {
    const confirmSpy = vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    const resetSpy = vi.spyOn(store, "asyncDeleteAllCashFlows").mockResolvedValue();

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.find("[data-testid='btn-reset-all']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(confirmSpy).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalled();
  });

  it("cancels reset all action", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    const resetSpy = vi.spyOn(store, "asyncDeleteAllCashFlows");

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.find("[data-testid='btn-reset-all']").trigger("click");

    expect(resetSpy).not.toHaveBeenCalled();
  });

  it("handles reset all error", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    vi.spyOn(store, "asyncDeleteAllCashFlows").mockRejectedValue(new Error("Reset failed"));

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.find("[data-testid='btn-reset-all']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Mereset", "Reset failed");
  });

  it("handles reset all error without message", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    store.cashFlows = mockTransactions;
    vi.spyOn(store, "asyncDeleteAllCashFlows").mockRejectedValue({});

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.find("[data-testid='btn-reset-all']").trigger("click");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Mereset", "Terjadi kesalahan saat mereset data.");
  });

  it("handles loadData error gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockRejectedValue(new Error("Load failed"));

    renderWithProviders(HomePage, { pinia });
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Data", "Load failed");
  });

  it("handles loadData error when asyncGetLabels rejects", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockResolvedValue([]);
    vi.spyOn(store, "asyncGetLabels").mockRejectedValue(new Error("Labels failed"));

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Data", "Labels failed");
  });

  it("handles loadData error when asyncGetLabels rejects without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockResolvedValue([]);
    vi.spyOn(store, "asyncGetLabels").mockRejectedValue({});

    const wrapper = renderWithProviders(HomePage, { pinia });
    await wrapper.vm.$nextTick();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Data", "Tidak dapat memuat daftar arus kas.");
  });

  it("handles loadData error without message gracefully", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockRejectedValue({});

    renderWithProviders(HomePage, { pinia });
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Data", "Tidak dapat memuat daftar arus kas.");
  });

  it("handles loadData error when error is null", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncGetCashFlows").mockRejectedValue(null);

    renderWithProviders(HomePage, { pinia });
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memuat Data", "Tidak dapat memuat daftar arus kas.");
  });
});
