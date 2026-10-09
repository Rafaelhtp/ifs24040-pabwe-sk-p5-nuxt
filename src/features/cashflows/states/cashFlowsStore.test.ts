import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import * as api from "../api/cashFlowApi";
import { normalizeStats, useCashFlowsStore } from "./cashFlowsStore";

vi.mock("../api/cashFlowApi", () => ({
  getCashFlows: vi.fn(),
  getCashFlow: vi.fn(),
  getLabels: vi.fn(),
  getStatsDaily: vi.fn(),
  getStatsMonthly: vi.fn(),
  postCashFlow: vi.fn(),
  putCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
  deleteAllCashFlows: vi.fn(),
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const mocked = api as unknown as Record<string, ReturnType<typeof vi.fn>>;
const ok = { status: "success", message: "Berhasil" };
const fail = { status: "fail", message: "Gagal" };
const item = {
  id: 1,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "gaji",
  description: "d",
  nominal: 100,
  created_at: "2024-10-05T12:09:16.000000Z",
  updated_at: "2024-10-05T12:09:16.000000Z",
};
const payload = { type: "inflow", source: "cash", label: "gaji", description: "d", nominal: 100 } as const;

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("normalizeStats", () => {
  it("should default missing keys to 0", () => {
    expect(normalizeStats({})).toEqual({
      cashflow: 0,
      total_inflow: 0,
      total_outflow: 0,
      cash: 0,
      savings: 0,
      loans: 0,
    });
  });

  it("should compute balance per source from inflow and outflow", () => {
    const stats = normalizeStats({
      cashflow: 2000000,
      total_inflow: 2500000,
      total_outflow: 500000,
      total_inflow_cash: 2500000,
      total_outflow_cash: 100000,
      total_outflow_savings: 400000,
      total_inflow_loans: 50,
    });
    expect(stats).toEqual({
      cashflow: 2000000,
      total_inflow: 2500000,
      total_outflow: 500000,
      cash: 2400000,
      savings: -400000,
      loans: 50,
    });
  });
});

describe("cashFlowsStore", () => {
  it("asyncGetCashFlows should store list and normalized stats", async () => {
    mocked.getCashFlows.mockResolvedValue({
      ...ok,
      data: { cash_flows: [item], stats: { cashflow: 100, total_inflow: 100, total_inflow_cash: 100 } },
    });
    const store = useCashFlowsStore();

    await expect(store.asyncGetCashFlows({ type: "inflow" })).resolves.toBe(true);

    expect(mocked.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
    expect(store.cashFlows).toEqual([item]);
    expect(store.stats.cash).toBe(100);
    expect(store.isCashFlow).toBe(false);
  });

  it("asyncGetCashFlows should use empty params by default and show error on failure", async () => {
    mocked.getCashFlows.mockResolvedValue(fail);
    const store = useCashFlowsStore();

    await expect(store.asyncGetCashFlows()).resolves.toBe(false);

    expect(mocked.getCashFlows).toHaveBeenCalledWith({});
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncGetCashFlow should store detail", async () => {
    mocked.getCashFlow.mockResolvedValue({ ...ok, data: { cash_flow: item } });
    const store = useCashFlowsStore();
    await expect(store.asyncGetCashFlow(1)).resolves.toBe(true);
    expect(store.cashFlow).toEqual(item);
  });

  it("asyncGetCashFlow should show error on failure", async () => {
    mocked.getCashFlow.mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await expect(store.asyncGetCashFlow(1)).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncGetLabels should store labels or return false", async () => {
    const store = useCashFlowsStore();
    mocked.getLabels.mockResolvedValueOnce({ ...ok, data: { labels: ["gaji"] } });
    await expect(store.asyncGetLabels()).resolves.toBe(true);
    expect(store.labels).toEqual(["gaji"]);

    mocked.getLabels.mockResolvedValueOnce(fail);
    await expect(store.asyncGetLabels()).resolves.toBe(false);
  });

  it("asyncGetStatsDaily should store stats or return false", async () => {
    const store = useCashFlowsStore();
    const data = { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} };

    mocked.getStatsDaily.mockResolvedValueOnce({ ...ok, data });
    await expect(store.asyncGetStatsDaily()).resolves.toBe(true);
    expect(mocked.getStatsDaily).toHaveBeenCalledWith({});
    expect(store.statsDaily).toEqual(data);

    mocked.getStatsDaily.mockResolvedValueOnce(fail);
    await expect(store.asyncGetStatsDaily({ total_data: 3 })).resolves.toBe(false);
  });

  it("asyncGetStatsMonthly should store stats or return false", async () => {
    const store = useCashFlowsStore();
    const data = { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} };

    mocked.getStatsMonthly.mockResolvedValueOnce({ ...ok, data });
    await expect(store.asyncGetStatsMonthly()).resolves.toBe(true);
    expect(mocked.getStatsMonthly).toHaveBeenCalledWith({});
    expect(store.statsMonthly).toEqual(data);

    mocked.getStatsMonthly.mockResolvedValueOnce(fail);
    await expect(store.asyncGetStatsMonthly({ total_data: 3 })).resolves.toBe(false);
  });

  it("asyncAddCashFlow should flag added and show success", async () => {
    mocked.postCashFlow.mockResolvedValue(ok);
    const store = useCashFlowsStore();
    await expect(store.asyncAddCashFlow(payload)).resolves.toBe(true);
    expect(store.isCashFlowAdded).toBe(true);
    expect(store.isCashFlowAdd).toBe(false);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
  });

  it("asyncAddCashFlow should show error on failure", async () => {
    mocked.postCashFlow.mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await expect(store.asyncAddCashFlow(payload)).resolves.toBe(false);
    expect(store.isCashFlowAdded).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncChangeCashFlow should flag changed and show success", async () => {
    mocked.putCashFlow.mockResolvedValue(ok);
    const store = useCashFlowsStore();
    await expect(store.asyncChangeCashFlow(1, payload)).resolves.toBe(true);
    expect(mocked.putCashFlow).toHaveBeenCalledWith(1, payload);
    expect(store.isCashFlowChanged).toBe(true);
    expect(store.isCashFlowChange).toBe(false);
  });

  it("asyncChangeCashFlow should show error on failure", async () => {
    mocked.putCashFlow.mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await expect(store.asyncChangeCashFlow(1, payload)).resolves.toBe(false);
    expect(store.isCashFlowChanged).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncDeleteCashFlow should flag deleted and show success", async () => {
    mocked.deleteCashFlow.mockResolvedValue(ok);
    const store = useCashFlowsStore();
    await expect(store.asyncDeleteCashFlow(1)).resolves.toBe(true);
    expect(store.isCashFlowDeleted).toBe(true);
    expect(store.isCashFlowDelete).toBe(false);
  });

  it("asyncDeleteCashFlow should show error on failure", async () => {
    mocked.deleteCashFlow.mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await expect(store.asyncDeleteCashFlow(1)).resolves.toBe(false);
    expect(store.isCashFlowDeleted).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });

  it("asyncDeleteAllCashFlows should flag deleted all and show success", async () => {
    mocked.deleteAllCashFlows.mockResolvedValue(ok);
    const store = useCashFlowsStore();
    await expect(store.asyncDeleteAllCashFlows()).resolves.toBe(true);
    expect(store.isCashFlowDeletedAll).toBe(true);
    expect(store.isCashFlowDeleteAll).toBe(false);
  });

  it("asyncDeleteAllCashFlows should show error on failure", async () => {
    mocked.deleteAllCashFlows.mockResolvedValue(fail);
    const store = useCashFlowsStore();
    await expect(store.asyncDeleteAllCashFlows()).resolves.toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
  });
});
