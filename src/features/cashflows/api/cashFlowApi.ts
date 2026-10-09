import { apiRequest } from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface StatsQueryParams {
  end_date?: string;
  total_data?: number;
}

/** Statistik mentah dari API (kunci dinamis, mis. total_inflow_cash). */
export type RawCashFlowStats = Record<string, number>;

export interface PeriodStatsData {
  stats_inflow: Record<string, number>;
  stats_outflow: Record<string, number>;
  stats_cashflow: Record<string, number>;
}

export const getCashFlows = (params: CashFlowQueryParams = {}) =>
  apiRequest<{ cash_flows: CashFlow[]; stats: RawCashFlowStats }>("/cash-flows", {
    query: { ...params },
  });

export const getCashFlow = (id: number | string) =>
  apiRequest<{ cash_flow: CashFlow }>(`/cash-flows/${id}`);

export const postCashFlow = (payload: CashFlowPayload) =>
  apiRequest<{ cash_flow_id: number }>("/cash-flows", { method: "POST", body: payload });

export const putCashFlow = (id: number | string, payload: CashFlowPayload) =>
  apiRequest(`/cash-flows/${id}`, { method: "PUT", body: payload });

export const deleteCashFlow = (id: number | string) =>
  apiRequest(`/cash-flows/${id}`, { method: "DELETE" });

export const getLabels = () => apiRequest<{ labels: string[] }>("/cash-flows/labels");

export const getStatsDaily = (params: StatsQueryParams = {}) =>
  apiRequest<PeriodStatsData>("/cash-flows/stats/daily", { query: { ...params } });

export const getStatsMonthly = (params: StatsQueryParams = {}) =>
  apiRequest<PeriodStatsData>("/cash-flows/stats/monthly", { query: { ...params } });

export const deleteAllCashFlows = () => apiRequest("/cash-flows", { method: "DELETE" });
