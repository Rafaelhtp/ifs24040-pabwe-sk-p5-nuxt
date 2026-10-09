import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
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
} from "./cashFlowApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

const apiRequestMock = apiRequest as unknown as ReturnType<typeof vi.fn>;
const payload = { type: "inflow", source: "cash", label: "gaji", description: "d", nominal: 1 } as const;

beforeEach(() => {
  apiRequestMock.mockReset();
  apiRequestMock.mockResolvedValue({ status: "success", message: "ok" });
});

describe("cashFlowApi", () => {
  it("getCashFlows should call /cash-flows with default empty query", async () => {
    await getCashFlows();
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows", { query: {} });
  });

  it("getCashFlows should pass filter params", async () => {
    await getCashFlows({ type: "inflow", label: "gaji" });
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows", { query: { type: "inflow", label: "gaji" } });
  });

  it("getCashFlow should call /cash-flows/:id", async () => {
    await getCashFlow(3);
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows/3");
  });

  it("postCashFlow should POST payload", async () => {
    await postCashFlow(payload);
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
  });

  it("putCashFlow should PUT payload", async () => {
    await putCashFlow(3, payload);
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows/3", { method: "PUT", body: payload });
  });

  it("deleteCashFlow should DELETE by id", async () => {
    await deleteCashFlow("3");
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows/3", { method: "DELETE" });
  });

  it("getLabels should call /cash-flows/labels", async () => {
    await getLabels();
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("getStatsDaily should call daily stats with default and custom params", async () => {
    await getStatsDaily();
    expect(apiRequestMock).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { query: {} });
    await getStatsDaily({ total_data: 7 });
    expect(apiRequestMock).toHaveBeenLastCalledWith("/cash-flows/stats/daily", { query: { total_data: 7 } });
  });

  it("getStatsMonthly should call monthly stats with default and custom params", async () => {
    await getStatsMonthly();
    expect(apiRequestMock).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { query: {} });
    await getStatsMonthly({ total_data: 12 });
    expect(apiRequestMock).toHaveBeenLastCalledWith("/cash-flows/stats/monthly", { query: { total_data: 12 } });
  });

  it("deleteAllCashFlows should DELETE collection", async () => {
    await deleteAllCashFlows();
    expect(apiRequestMock).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });
});
