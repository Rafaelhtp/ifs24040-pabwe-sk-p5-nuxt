import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCashFlowsStore, computeStatsFromCashFlows } from "./cashFlowsStore";
import { cashFlowApi, type CashFlow } from "../api/cashFlowApi";

describe("cashFlowsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe("computeStatsFromCashFlows", () => {
    it("computes stats correctly across inflow and outflow sources", () => {
      const flows: CashFlow[] = [
        {
          id: 1,
          type: "inflow",
          source: "cash",
          nominal: 100000,
          label: "A",
          created_at: "2026-01-01",
        },
        {
          id: 2,
          type: "outflow",
          source: "cash",
          nominal: 20000,
          label: "B",
          created_at: "2026-01-01",
        },
        {
          id: 3,
          type: "inflow",
          source: "savings",
          nominal: 50000,
          label: "C",
          created_at: "2026-01-01",
        },
        {
          id: 4,
          type: "outflow",
          source: "loans",
          nominal: 30000,
          label: "D",
          created_at: "2026-01-01",
        },
      ];

      const stats = computeStatsFromCashFlows(flows);
      expect(stats.total_inflow).toBe(150000);
      expect(stats.total_outflow).toBe(50000);
      expect(stats.net_balance).toBe(100000);
      expect(stats.cash_balance).toBe(80000);
      expect(stats.savings_balance).toBe(50000);
      expect(stats.loans_balance).toBe(-30000);
    });

    it("handles zero nominal or fallback gracefully", () => {
      const flows: CashFlow[] = [
        {
          id: 1,
          type: "inflow",
          source: "cash",
          nominal: NaN as any,
          label: "A",
          created_at: "2026-01-01",
        },
      ];
      const stats = computeStatsFromCashFlows(flows);
      expect(stats.total_inflow).toBe(0);
      expect(stats.cash_balance).toBe(0);
    });
  });

  describe("store actions", () => {
    it("fetches cash flows and updates stats", async () => {
      const store = useCashFlowsStore();
      const mockFlows: CashFlow[] = [
        {
          id: "cf-1",
          type: "inflow",
          source: "cash",
          label: "Gaji",
          nominal: 5000000,
          created_at: "2026-01-01",
        },
      ];
      vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValueOnce({
        success: true,
        data: mockFlows,
      });

      const res = await store.asyncGetCashFlows();
      expect(res).toEqual(mockFlows);
      expect(store.cashFlows).toEqual(mockFlows);
      expect(store.stats.total_inflow).toBe(5000000);
      expect(store.isLoadingCashFlows).toBe(false);
    });

    it("handles fallback if getCashFlows data is null", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValueOnce({
        success: true,
        data: null as any,
      });

      const res = await store.asyncGetCashFlows();
      expect(res).toEqual([]);
      expect(store.cashFlows).toEqual([]);
    });

    it("fetches single cashflow by id", async () => {
      const store = useCashFlowsStore();
      const mockFlow: CashFlow = {
        id: "cf-1",
        type: "inflow",
        source: "cash",
        label: "Gaji",
        nominal: 5000000,
        created_at: "2026-01-01",
      };
      vi.spyOn(cashFlowApi, "getCashFlowById").mockResolvedValueOnce({
        success: true,
        data: mockFlow,
      });

      const res = await store.asyncGetCashFlowById("cf-1");
      expect(res).toEqual(mockFlow);
      expect(store.cashFlow).toEqual(mockFlow);
    });

    it("handles fallback if single cashflow is null", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getCashFlowById").mockResolvedValueOnce({
        success: true,
        data: null as any,
      });

      const res = await store.asyncGetCashFlowById("cf-99");
      expect(res).toBeNull();
      expect(store.cashFlow).toBeNull();
    });

    it("adds cash flow successfully and updates array and stats", async () => {
      const store = useCashFlowsStore();
      const newFlow: CashFlow = {
        id: "cf-new",
        type: "outflow",
        source: "cash",
        label: "Belanja",
        nominal: 100000,
        created_at: "2026-01-02",
      };
      vi.spyOn(cashFlowApi, "addCashFlow").mockResolvedValueOnce({
        success: true,
        data: newFlow,
      });

      const res = await store.asyncAddCashFlow({
        type: "outflow",
        source: "cash",
        label: "Belanja",
        nominal: 100000,
      });

      expect(res).toEqual(newFlow);
      expect(store.cashFlows[0]).toEqual(newFlow);
      expect(store.isCashFlowAdded).toBe(true);
      expect(store.isCashFlowAdd).toBe(false);
      expect(store.stats.total_outflow).toBe(100000);
    });

    it("updates cash flow successfully and recomputes stats", async () => {
      const store = useCashFlowsStore();
      store.cashFlows = [
        {
          id: "cf-1",
          type: "inflow",
          source: "cash",
          label: "Bonus",
          nominal: 200000,
          created_at: "2026-01-01",
        },
      ];
      store.cashFlow = { ...store.cashFlows[0] };

      const updated: CashFlow = {
        ...store.cashFlows[0],
        nominal: 300000,
      };

      vi.spyOn(cashFlowApi, "updateCashFlow").mockResolvedValueOnce({
        success: true,
        data: updated,
      });

      const res = await store.asyncUpdateCashFlow("cf-1", { nominal: 300000 });
      expect(res).toEqual(updated);
      expect(store.cashFlows[0].nominal).toBe(300000);
      expect(store.cashFlow?.nominal).toBe(300000);
      expect(store.isCashFlowChanged).toBe(true);
      expect(store.stats.total_inflow).toBe(300000);
    });

    it("deletes cash flow and removes from state", async () => {
      const store = useCashFlowsStore();
      store.cashFlows = [
        {
          id: "cf-1",
          type: "inflow",
          source: "cash",
          label: "Bonus",
          nominal: 200000,
          created_at: "2026-01-01",
        },
      ];
      store.cashFlow = store.cashFlows[0];

      vi.spyOn(cashFlowApi, "deleteCashFlow").mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await store.asyncDeleteCashFlow("cf-1");
      expect(store.cashFlows).toHaveLength(0);
      expect(store.cashFlow).toBeNull();
      expect(store.isCashFlowDeleted).toBe(true);
      expect(store.stats.total_inflow).toBe(0);
    });

    it("fetches labels and handles catch fallback", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getLabels").mockResolvedValueOnce({
        success: true,
        data: ["Gaji", "Makan"],
      });

      let labels = await store.asyncGetLabels();
      expect(labels).toEqual(["Gaji", "Makan"]);

      vi.spyOn(cashFlowApi, "getLabels").mockRejectedValueOnce(new Error("err"));
      labels = await store.asyncGetLabels();
      expect(labels).toEqual([]);

      vi.spyOn(cashFlowApi, "getLabels").mockResolvedValueOnce({ success: true, data: null as any });
      labels = await store.asyncGetLabels();
      expect(labels).toEqual([]);
    });

    it("fetches daily metrics and handles catch fallback", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getDailyStats").mockResolvedValueOnce({
        success: true,
        data: [{ date: "2026-01-01", inflow: 100, outflow: 0, net: 100 }],
      });

      let daily = await store.asyncGetDailyMetrics();
      expect(daily).toHaveLength(1);

      vi.spyOn(cashFlowApi, "getDailyStats").mockRejectedValueOnce(new Error("err"));
      daily = await store.asyncGetDailyMetrics();
      expect(daily).toEqual([]);

      vi.spyOn(cashFlowApi, "getDailyStats").mockResolvedValueOnce({ success: true, data: null as any });
      daily = await store.asyncGetDailyMetrics();
      expect(daily).toEqual([]);
    });

    it("fetches monthly metrics and handles catch fallback", async () => {
      const store = useCashFlowsStore();
      vi.spyOn(cashFlowApi, "getMonthlyStats").mockResolvedValueOnce({
        success: true,
        data: [{ month: "2026-01", inflow: 500, outflow: 100, net: 400 }],
      });

      let monthly = await store.asyncGetMonthlyMetrics();
      expect(monthly).toHaveLength(1);

      vi.spyOn(cashFlowApi, "getMonthlyStats").mockRejectedValueOnce(new Error("err"));
      monthly = await store.asyncGetMonthlyMetrics();
      expect(monthly).toEqual([]);

      vi.spyOn(cashFlowApi, "getMonthlyStats").mockResolvedValueOnce({ success: true, data: null as any });
      monthly = await store.asyncGetMonthlyMetrics();
      expect(monthly).toEqual([]);
    });

    it("deletes all cash flows and resets state", async () => {
      const store = useCashFlowsStore();
      store.cashFlows = [
        {
          id: "cf-1",
          type: "inflow",
          source: "cash",
          label: "Bonus",
          nominal: 200000,
          created_at: "2026-01-01",
        },
      ];
      store.cashFlow = store.cashFlows[0];

      vi.spyOn(cashFlowApi, "deleteAllCashFlows").mockResolvedValueOnce({
        success: true,
        data: null,
      });

      await store.asyncDeleteAllCashFlows();
      expect(store.cashFlows).toEqual([]);
      expect(store.cashFlow).toBeNull();
      expect(store.isCashFlowDeletedAll).toBe(true);
      expect(store.stats.total_inflow).toBe(0);
    });
  });
});
