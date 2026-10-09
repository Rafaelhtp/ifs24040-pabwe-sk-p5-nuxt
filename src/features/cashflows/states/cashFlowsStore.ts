import { defineStore } from "pinia";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
  type CashFlow,
  type CashFlowPayload,
  type CashFlowQueryParams,
  type PeriodStatsData,
  type RawCashFlowStats,
  type StatsQueryParams,
} from "../api/cashFlowApi";

export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: PeriodStatsData | null;
  statsMonthly: PeriodStatsData | null;
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

const emptyStats = (): CashFlowStats => ({
  cashflow: 0,
  total_inflow: 0,
  total_outflow: 0,
  cash: 0,
  savings: 0,
  loans: 0,
});

/** Statistik dari API hanya memuat kunci yang punya nilai, sehingga default-nya 0. */
const num = (value: number | undefined): number => value ?? 0;

export function normalizeStats(raw: RawCashFlowStats): CashFlowStats {
  return {
    cashflow: num(raw.cashflow),
    total_inflow: num(raw.total_inflow),
    total_outflow: num(raw.total_outflow),
    cash: num(raw.total_inflow_cash) - num(raw.total_outflow_cash),
    savings: num(raw.total_inflow_savings) - num(raw.total_outflow_savings),
    loans: num(raw.total_inflow_loans) - num(raw.total_outflow_loans),
  };
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlow: false,
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
    async asyncGetCashFlows(params: CashFlowQueryParams = {}): Promise<boolean> {
      this.isCashFlow = true;
      const result = await getCashFlows(params);
      this.isCashFlow = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.cashFlows = result.data.cash_flows;
      this.stats = normalizeStats(result.data.stats);
      return true;
    },

    async asyncGetCashFlow(id: number | string): Promise<boolean> {
      this.isCashFlow = true;
      const result = await getCashFlow(id);
      this.isCashFlow = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.cashFlow = result.data.cash_flow;
      return true;
    },

    async asyncGetLabels(): Promise<boolean> {
      const result = await getLabels();
      if (result.status !== "success") {
        return false;
      }
      this.labels = result.data.labels;
      return true;
    },

    async asyncGetStatsDaily(params: StatsQueryParams = {}): Promise<boolean> {
      const result = await getStatsDaily(params);
      if (result.status !== "success") {
        return false;
      }
      this.statsDaily = result.data;
      return true;
    },

    async asyncGetStatsMonthly(params: StatsQueryParams = {}): Promise<boolean> {
      const result = await getStatsMonthly(params);
      if (result.status !== "success") {
        return false;
      }
      this.statsMonthly = result.data;
      return true;
    },

    async asyncAddCashFlow(payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      const result = await postCashFlow(payload);
      this.isCashFlowAdd = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.isCashFlowAdded = true;
      await showSuccessDialog(result.message);
      return true;
    },

    async asyncChangeCashFlow(id: number | string, payload: CashFlowPayload): Promise<boolean> {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      const result = await putCashFlow(id, payload);
      this.isCashFlowChange = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.isCashFlowChanged = true;
      await showSuccessDialog(result.message);
      return true;
    },

    async asyncDeleteCashFlow(id: number | string): Promise<boolean> {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      const result = await deleteCashFlow(id);
      this.isCashFlowDelete = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.isCashFlowDeleted = true;
      await showSuccessDialog(result.message);
      return true;
    },

    async asyncDeleteAllCashFlows(): Promise<boolean> {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      const result = await deleteAllCashFlows();
      this.isCashFlowDeleteAll = false;

      if (result.status !== "success") {
        await showErrorDialog(result.message);
        return false;
      }
      this.isCashFlowDeletedAll = true;
      await showSuccessDialog(result.message);
      return true;
    },
  },
});
