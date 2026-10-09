import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import type { CashFlow } from "../api/cashFlowApi";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import HomePage from "./HomePage.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showConfirmDialog: vi.fn(), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const items: CashFlow[] = [
  {
    id: 1,
    user_id: 1,
    type: "inflow",
    source: "cash",
    label: "gaji",
    description: "Gaji bulanan",
    nominal: 2500000,
    created_at: "2024-10-05T11:26:45.000000Z",
    updated_at: "2024-10-05T11:26:48.000000Z",
  },
  {
    id: 2,
    user_id: 1,
    type: "outflow",
    source: "savings",
    label: "elektronik",
    description: "Keyboard dan mouse",
    nominal: 400000,
    created_at: "2024-10-05T12:09:16.000000Z",
    updated_at: "2024-10-05T12:09:16.000000Z",
  },
];

interface Options {
  deleteResult?: boolean;
  deleteAllResult?: boolean;
  prepare?: (store: ReturnType<typeof useCashFlowsStore>) => void;
}

function setup(options: Options = {}) {
  return renderWithProviders(HomePage, {
    beforeMount: (pinia) => {
      const store = useCashFlowsStore(pinia);
      vi.spyOn(store, "asyncGetCashFlows").mockResolvedValue(true);
      vi.spyOn(store, "asyncGetLabels").mockResolvedValue(true);
      vi.spyOn(store, "asyncDeleteCashFlow").mockResolvedValue(options.deleteResult ?? true);
      vi.spyOn(store, "asyncDeleteAllCashFlows").mockResolvedValue(options.deleteAllResult ?? true);
      store.labels = ["gaji", "elektronik"];
      options.prepare?.(store);
    },
  });
}

function withItems(store: ReturnType<typeof useCashFlowsStore>) {
  store.cashFlows = items;
  store.stats = {
    cashflow: 2100000,
    total_inflow: 2500000,
    total_outflow: 400000,
    cash: 2500000,
    savings: -400000,
    loans: 0,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HomePage", () => {
  it("should load cash flows and labels on mount", async () => {
    const { pinia } = await setup();
    const store = useCashFlowsStore(pinia);

    expect(store.asyncGetCashFlows).toHaveBeenCalledWith({
      type: "",
      source: "",
      label: "",
      start_date: "",
      end_date: "",
    });
    expect(store.asyncGetLabels).toHaveBeenCalledTimes(1);
  });

  it("should render six summary cards with formatted rupiah", async () => {
    const { wrapper } = await setup({ prepare: withItems });

    expect(wrapper.findAll('[data-testid^="card-"]')).toHaveLength(6);
    expect(wrapper.find('[data-testid="card-cashflow"]').text()).toContain("2.100.000");
    expect(wrapper.find('[data-testid="card-inflow"]').text()).toContain("2.500.000");
    expect(wrapper.find('[data-testid="card-outflow"]').text()).toContain("400.000");
    expect(wrapper.find('[data-testid="card-savings"]').text()).toContain("400.000");
  });

  it("should render transactions with inflow and outflow badges", async () => {
    const { wrapper } = await setup({ prepare: withItems });

    const rows = wrapper.findAll('[data-testid="cashflow-item"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].find('[data-testid="badge"]').text()).toBe("Pemasukan");
    expect(rows[0].find('[data-testid="badge"]').classes()).toContain("text-emerald-700");
    expect(rows[0].text()).toContain("+");
    expect(rows[1].find('[data-testid="badge"]').text()).toBe("Pengeluaran");
    expect(rows[1].find('[data-testid="badge"]').classes()).toContain("text-rose-700");
    expect(rows[1].text()).toContain("-");
    expect(rows[0].find('[data-testid="btn-detail"]').attributes("href")).toBe("/cash-flows/1");
  });

  it("should show empty state when there are no transactions", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="cashflow-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cashflow-list"]').exists()).toBe(false);
  });

  it("should show loading state", async () => {
    const { wrapper } = await setup({
      prepare: (store) => {
        store.isCashFlow = true;
      },
    });
    expect(wrapper.find('[data-testid="cashflow-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cashflow-empty"]').exists()).toBe(false);
  });

  it("should apply filters with date range timestamps", async () => {
    const { wrapper, pinia } = await setup({ prepare: withItems });
    const store = useCashFlowsStore(pinia);

    await wrapper.find('[data-testid="filter-type"]').setValue("outflow");
    await wrapper.find('[data-testid="filter-source"]').setValue("savings");
    await wrapper.find('[data-testid="filter-label"]').setValue("elektronik");
    await wrapper.find('[data-testid="filter-start"]').setValue("2024-10-01");
    await wrapper.find('[data-testid="filter-end"]').setValue("2024-10-31");
    await wrapper.find('[data-testid="filter-form"]').trigger("submit");
    await flushPromises();

    expect(store.asyncGetCashFlows).toHaveBeenLastCalledWith({
      type: "outflow",
      source: "savings",
      label: "elektronik",
      start_date: "2024-10-01 00:00:00",
      end_date: "2024-10-31 23:59:59",
    });
  });

  it("should reset filters and reload", async () => {
    const { wrapper, pinia } = await setup({ prepare: withItems });
    const store = useCashFlowsStore(pinia);

    await wrapper.find('[data-testid="filter-type"]').setValue("inflow");
    await wrapper.find('[data-testid="filter-reset"]').trigger("click");
    await flushPromises();

    expect(store.asyncGetCashFlows).toHaveBeenLastCalledWith({
      type: "",
      source: "",
      label: "",
      start_date: "",
      end_date: "",
    });
    expect((wrapper.find('[data-testid="filter-type"]').element as HTMLSelectElement).value).toBe("");
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = await setup();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);

    await wrapper.find('[data-testid="btn-add"]').trigger("click");
    expect(wrapper.findComponent(AddModal).exists()).toBe(true);

    wrapper.findComponent(AddModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
  });

  it("should reload data after the add modal saved", async () => {
    const { wrapper, pinia } = await setup();
    const store = useCashFlowsStore(pinia);
    await wrapper.find('[data-testid="btn-add"]').trigger("click");

    wrapper.findComponent(AddModal).vm.$emit("saved");
    await flushPromises();

    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
    expect(store.asyncGetLabels).toHaveBeenCalledTimes(2);
  });

  it("should open the change modal for a transaction, close it, and reload after save", async () => {
    const { wrapper, pinia } = await setup({ prepare: withItems });
    const store = useCashFlowsStore(pinia);

    await wrapper.findAll('[data-testid="btn-edit"]')[1].trigger("click");
    expect(wrapper.findComponent(ChangeModal).props("cashFlow")).toEqual(items[1]);

    wrapper.findComponent(ChangeModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await wrapper.findAll('[data-testid="btn-edit"]')[0].trigger("click");
    wrapper.findComponent(ChangeModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should not delete a transaction when confirmation is cancelled", async () => {
    (showConfirmDialog as any).mockResolvedValue(false);
    const { wrapper, pinia } = await setup({ prepare: withItems });

    await wrapper.findAll('[data-testid="btn-delete"]')[0].trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncDeleteCashFlow).not.toHaveBeenCalled();
  });

  it("should delete a transaction and reload when confirmed", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia } = await setup({ prepare: withItems });
    const store = useCashFlowsStore(pinia);

    await wrapper.findAll('[data-testid="btn-delete"]')[0].trigger("click");
    await flushPromises();

    expect(store.asyncDeleteCashFlow).toHaveBeenCalledWith(1);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should not reload when deleting a transaction fails", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia } = await setup({ prepare: withItems, deleteResult: false });

    await wrapper.findAll('[data-testid="btn-delete"]')[0].trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncGetCashFlows).toHaveBeenCalledTimes(1);
  });

  it("should not reset all transactions when confirmation is cancelled", async () => {
    (showConfirmDialog as any).mockResolvedValue(false);
    const { wrapper, pinia } = await setup({ prepare: withItems });

    await wrapper.find('[data-testid="btn-delete-all"]').trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncDeleteAllCashFlows).not.toHaveBeenCalled();
  });

  it("should reset all transactions and reload when confirmed", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia } = await setup({ prepare: withItems });
    const store = useCashFlowsStore(pinia);

    await wrapper.find('[data-testid="btn-delete-all"]').trigger("click");
    await flushPromises();

    expect(store.asyncDeleteAllCashFlows).toHaveBeenCalledTimes(1);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should not reload when resetting all transactions fails", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia } = await setup({ prepare: withItems, deleteAllResult: false });

    await wrapper.find('[data-testid="btn-delete-all"]').trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncGetCashFlows).toHaveBeenCalledTimes(1);
  });
});
