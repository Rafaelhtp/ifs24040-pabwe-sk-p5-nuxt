import { defineStore } from "pinia";
import {
  cashFlowApi,
  type CashFlow,
  type CashFlowQueryParams,
  type CashFlowPayload,
  type CashFlowStats,
  type DailyMetric,
  type MonthlyMetric,
} from "../api/cashFlowApi";

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  labels: string[];
  stats: CashFlowStats;
  dailyMetrics: DailyMetric[];
  monthlyMetrics: MonthlyMetric[];
  isLoadingCashFlows: boolean;
  isLoadingCashFlow: boolean;
  isLoadingStats: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

const initialStats: CashFlowStats = {
  total_inflow: 0,
  total_outflow: 0,
  net_balance: 0,
  cash_balance: 0,
  savings_balance: 0,
  loans_balance: 0,
};

export function computeStatsFromCashFlows(cashFlows: CashFlow[]): CashFlowStats {
  let total_inflow = 0;
  let total_outflow = 0;
  let cash_balance = 0;
  let savings_balance = 0;
  let loans_balance = 0;

  for (const item of cashFlows) {
    const nominal = Number(item.nominal) || 0;
    const sign = item.type === "inflow" ? 1 : -1;

    if (item.type === "inflow") {
      total_inflow += nominal;
    } else {
      total_outflow += nominal;
    }

    if (item.source === "cash") {
      cash_balance += sign * nominal;
    } else if (item.source === "savings") {
      savings_balance += sign * nominal;
    } else if (item.source === "loans") {
      loans_balance += sign * nominal;
    }
  }

  return {
    total_inflow,
    total_outflow,
    net_balance: total_inflow - total_outflow,
    cash_balance,
    savings_balance,
    loans_balance,
  };
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    labels: [],
    stats: { ...initialStats },
    dailyMetrics: [],
    monthlyMetrics: [],
    isLoadingCashFlows: false,
    isLoadingCashFlow: false,
    isLoadingStats: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),

  actions: {
    async asyncGetCashFlows(params?: CashFlowQueryParams): Promise<CashFlow[]> {
      this.isLoadingCashFlows = true;
      try {
        const response = await cashFlowApi.getCashFlows(params);
        this.cashFlows = response.data || [];
        this.stats = computeStatsFromCashFlows(this.cashFlows);
        return this.cashFlows;
      } finally {
        this.isLoadingCashFlows = false;
      }
    },

    async asyncGetCashFlowById(id: string | number): Promise<CashFlow | null> {
      this.isLoadingCashFlow = true;
      try {
        const response = await cashFlowApi.getCashFlowById(id);
        this.cashFlow = response.data || null;
        return this.cashFlow;
      } finally {
        this.isLoadingCashFlow = false;
      }
    },

    async asyncAddCashFlow(payload: CashFlowPayload): Promise<CashFlow> {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      try {
        const response = await cashFlowApi.addCashFlow(payload);
        this.isCashFlowAdded = true;
        if (response.data) {
          this.cashFlows.unshift(response.data);
          this.stats = computeStatsFromCashFlows(this.cashFlows);
        }
        return response.data;
      } finally {
        this.isCashFlowAdd = false;
      }
    },

    async asyncUpdateCashFlow(id: string | number, payload: Partial<CashFlowPayload>): Promise<CashFlow> {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      try {
        const response = await cashFlowApi.updateCashFlow(id, payload);
        this.isCashFlowChanged = true;
        if (response.data) {
          const index = this.cashFlows.findIndex((c) => String(c.id) === String(id));
          if (index !== -1) {
            this.cashFlows[index] = { ...this.cashFlows[index], ...response.data };
          }
          if (this.cashFlow && String(this.cashFlow.id) === String(id)) {
            this.cashFlow = { ...this.cashFlow, ...response.data };
          }
          this.stats = computeStatsFromCashFlows(this.cashFlows);
        }
        return response.data;
      } finally {
        this.isCashFlowChange = false;
      }
    },

    async asyncDeleteCashFlow(id: string | number): Promise<void> {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      try {
        await cashFlowApi.deleteCashFlow(id);
        this.isCashFlowDeleted = true;
        this.cashFlows = this.cashFlows.filter((c) => String(c.id) !== String(id));
        if (this.cashFlow && String(this.cashFlow.id) === String(id)) {
          this.cashFlow = null;
        }
        this.stats = computeStatsFromCashFlows(this.cashFlows);
      } finally {
        this.isCashFlowDelete = false;
      }
    },

    async asyncGetLabels(): Promise<string[]> {
      try {
        const response = await cashFlowApi.getLabels();
        this.labels = response.data || [];
        return this.labels;
      } catch {
        return [];
      }
    },

    async asyncGetDailyMetrics(): Promise<DailyMetric[]> {
      try {
        const response = await cashFlowApi.getDailyStats();
        this.dailyMetrics = response.data || [];
        return this.dailyMetrics;
      } catch {
        return [];
      }
    },

    async asyncGetMonthlyMetrics(): Promise<MonthlyMetric[]> {
      try {
        const response = await cashFlowApi.getMonthlyStats();
        this.monthlyMetrics = response.data || [];
        return this.monthlyMetrics;
      } catch {
        return [];
      }
    },

    async asyncDeleteAllCashFlows(): Promise<void> {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      try {
        await cashFlowApi.deleteAllCashFlows();
        this.isCashFlowDeletedAll = true;
        this.cashFlows = [];
        this.cashFlow = null;
        this.stats = { ...initialStats };
      } finally {
        this.isCashFlowDeleteAll = false;
      }
    },
  },
});
