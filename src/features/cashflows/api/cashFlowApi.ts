import { fetchWithAuth } from "~/helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: string | number;
  user_id?: string | number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CashFlowQueryParams {
  type?: CashFlowType;
  source?: CashFlowSource;
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description?: string;
}

export interface CashFlowStats {
  total_inflow: number;
  total_outflow: number;
  net_balance: number;
  cash_balance: number;
  savings_balance: number;
  loans_balance: number;
}

export interface DailyMetric {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface MonthlyMetric {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const cashFlowApi = {
  async getCashFlows(params?: CashFlowQueryParams): Promise<ApiResponse<CashFlow[]>> {
    return fetchWithAuth<ApiResponse<CashFlow[]>>("/cash-flows", {
      params,
    });
  },

  async getCashFlowById(id: string | number): Promise<ApiResponse<CashFlow>> {
    return fetchWithAuth<ApiResponse<CashFlow>>(`/cash-flows/${id}`);
  },

  async addCashFlow(payload: CashFlowPayload): Promise<ApiResponse<CashFlow>> {
    return fetchWithAuth<ApiResponse<CashFlow>>("/cash-flows", {
      method: "POST",
      body: payload as any,
    });
  },

  async updateCashFlow(id: string | number, payload: Partial<CashFlowPayload>): Promise<ApiResponse<CashFlow>> {
    return fetchWithAuth<ApiResponse<CashFlow>>(`/cash-flows/${id}`, {
      method: "PUT",
      body: payload as any,
    });
  },

  async deleteCashFlow(id: string | number): Promise<ApiResponse<null>> {
    return fetchWithAuth<ApiResponse<null>>(`/cash-flows/${id}`, {
      method: "DELETE",
    });
  },

  async getLabels(): Promise<ApiResponse<string[]>> {
    return fetchWithAuth<ApiResponse<string[]>>("/cash-flows/labels");
  },

  async getDailyStats(): Promise<ApiResponse<DailyMetric[]>> {
    return fetchWithAuth<ApiResponse<DailyMetric[]>>("/cash-flows/stats/daily");
  },

  async getMonthlyStats(): Promise<ApiResponse<MonthlyMetric[]>> {
    return fetchWithAuth<ApiResponse<MonthlyMetric[]>>("/cash-flows/stats/monthly");
  },

  async deleteAllCashFlows(): Promise<ApiResponse<null>> {
    return fetchWithAuth<ApiResponse<null>>("/cash-flows", {
      method: "DELETE",
    });
  },
};
