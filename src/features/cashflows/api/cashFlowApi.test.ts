import { describe, it, expect, vi, beforeEach } from "vitest";
import { cashFlowApi } from "./cashFlowApi";
import * as apiHelper from "~/helpers/apiHelper";

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls GET /cash-flows with query params", async () => {
    const mockRes = { success: true, data: [] };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const params = { type: "inflow" as const, label: "Gaji" };
    const res = await cashFlowApi.getCashFlows(params);

    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows", { params });
  });

  it("calls GET /cash-flows/:id", async () => {
    const mockRes = { success: true, data: { id: "123", label: "Gaji", nominal: 5000000 } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.getCashFlowById("123");
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/123");
  });

  it("calls POST /cash-flows", async () => {
    const payload = {
      type: "inflow" as const,
      source: "cash" as const,
      label: "Bonus",
      nominal: 1000000,
      description: "Bonus akhir tahun",
    };
    const mockRes = { success: true, data: { id: "456", ...payload } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.addCashFlow(payload);
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows", {
      method: "POST",
      body: payload,
    });
  });

  it("calls PUT /cash-flows/:id", async () => {
    const payload = { nominal: 1500000 };
    const mockRes = { success: true, data: { id: "456", nominal: 1500000 } };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.updateCashFlow("456", payload);
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/456", {
      method: "PUT",
      body: payload,
    });
  });

  it("calls DELETE /cash-flows/:id", async () => {
    const mockRes = { success: true, data: null };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.deleteCashFlow("456");
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/456", {
      method: "DELETE",
    });
  });

  it("calls GET /cash-flows/labels", async () => {
    const mockRes = { success: true, data: ["Gaji", "Makan"] };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.getLabels();
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("calls GET /cash-flows/stats/daily", async () => {
    const mockRes = { success: true, data: [] };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.getDailyStats();
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/stats/daily");
  });

  it("calls GET /cash-flows/stats/monthly", async () => {
    const mockRes = { success: true, data: [] };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.getMonthlyStats();
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows/stats/monthly");
  });

  it("calls DELETE /cash-flows to reset all", async () => {
    const mockRes = { success: true, data: null };
    const fetchSpy = vi.spyOn(apiHelper, "fetchWithAuth").mockResolvedValueOnce(mockRes as any);

    const res = await cashFlowApi.deleteAllCashFlows();
    expect(res).toEqual(mockRes);
    expect(fetchSpy).toHaveBeenCalledWith("/cash-flows", {
      method: "DELETE",
    });
  });
});
