import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { h } from "vue";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import type { CashFlow } from "../api/cashFlowApi";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import DetailPage from "./DetailPage.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showConfirmDialog: vi.fn(), showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const inflow: CashFlow = {
  id: 5,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
  created_at: "2024-10-05T11:26:45.000000Z",
  updated_at: "2024-10-05T11:26:48.000000Z",
};
const outflow: CashFlow = { ...inflow, type: "outflow", source: "savings", label: "elektronik" };

const Stub = { render: () => h("div") };
const routes = [
  { path: "/cash-flows/:cashFlowId", component: Stub },
  { path: "/:pathMatch(.*)*", component: Stub },
];

interface Options {
  data?: CashFlow;
  loadResult?: boolean;
  deleteResult?: boolean;
}

function setup(options: Options = {}) {
  return renderWithProviders(DetailPage, {
    route: "/cash-flows/5",
    routes,
    beforeMount: (pinia) => {
      const store = useCashFlowsStore(pinia);
      vi.spyOn(store, "asyncGetCashFlow").mockImplementation(async () => {
        if (options.data) {
          store.cashFlow = options.data;
        }
        return options.loadResult ?? true;
      });
      vi.spyOn(store, "asyncDeleteCashFlow").mockResolvedValue(options.deleteResult ?? true);
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DetailPage", () => {
  it("should load the transaction by route param", async () => {
    const { pinia } = await setup({ data: inflow });
    expect(useCashFlowsStore(pinia).asyncGetCashFlow).toHaveBeenCalledWith("5");
  });

  it("should show loading while the transaction is not available", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="detail-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="detail-card"]').exists()).toBe(false);
  });

  it("should redirect home when loading fails", async () => {
    const { router } = await setup({ loadResult: false });
    await flushPromises();
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("should render inflow details", async () => {
    const { wrapper } = await setup({ data: inflow });

    expect(wrapper.find('[data-testid="detail-badge"]').text()).toBe("Pemasukan");
    expect(wrapper.find('[data-testid="detail-badge"]').classes()).toContain("text-emerald-700");
    expect(wrapper.find('[data-testid="detail-nominal"]').text()).toContain("2.500.000");
    expect(wrapper.find('[data-testid="detail-label"]').text()).toBe("gaji");
    expect(wrapper.find('[data-testid="detail-source"]').text()).toBe("Tunai");
    expect(wrapper.find('[data-testid="detail-description"]').text()).toBe("Gaji bulanan");
  });

  it("should render outflow details", async () => {
    const { wrapper } = await setup({ data: outflow });

    expect(wrapper.find('[data-testid="detail-badge"]').text()).toBe("Pengeluaran");
    expect(wrapper.find('[data-testid="detail-badge"]').classes()).toContain("text-rose-700");
    expect(wrapper.find('[data-testid="detail-source"]').text()).toBe("Tabungan");
  });

  it("should open and close the change modal", async () => {
    const { wrapper } = await setup({ data: inflow });
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await wrapper.find('[data-testid="btn-edit"]').trigger("click");
    expect(wrapper.findComponent(ChangeModal).props("cashFlow")).toEqual(inflow);

    wrapper.findComponent(ChangeModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
  });

  it("should reload the transaction after the change modal saved", async () => {
    const { wrapper, pinia } = await setup({ data: inflow });
    await wrapper.find('[data-testid="btn-edit"]').trigger("click");

    wrapper.findComponent(ChangeModal).vm.$emit("saved");
    await flushPromises();

    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    expect(useCashFlowsStore(pinia).asyncGetCashFlow).toHaveBeenCalledTimes(2);
  });

  it("should not delete when confirmation is cancelled", async () => {
    (showConfirmDialog as any).mockResolvedValue(false);
    const { wrapper, pinia, router } = await setup({ data: inflow });

    await wrapper.find('[data-testid="btn-delete"]').trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncDeleteCashFlow).not.toHaveBeenCalled();
    expect(router.currentRoute.value.fullPath).toBe("/cash-flows/5");
  });

  it("should delete and go back home when confirmed", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, pinia, router } = await setup({ data: inflow });

    await wrapper.find('[data-testid="btn-delete"]').trigger("click");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncDeleteCashFlow).toHaveBeenCalledWith("5");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("should stay on the page when delete fails", async () => {
    (showConfirmDialog as any).mockResolvedValue(true);
    const { wrapper, router } = await setup({ data: inflow, deleteResult: false });

    await wrapper.find('[data-testid="btn-delete"]').trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe("/cash-flows/5");
  });
});
