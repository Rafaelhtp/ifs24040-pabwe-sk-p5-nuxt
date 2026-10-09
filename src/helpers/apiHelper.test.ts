import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, buildUrl, getAccessToken, putAccessToken } from "./apiHelper";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("token storage", () => {
  it("should store and read the access token", () => {
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
  });

  it("should remove the access token when value is empty", () => {
    putAccessToken("abc");
    putAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe("buildUrl", () => {
  it("should return url without query string by default", () => {
    expect(buildUrl("/users")).toBe(`${DELCOM_BASEURL}/users`);
  });

  it("should skip empty query values and keep the rest", () => {
    const url = buildUrl("/cash-flows", { type: "inflow", label: "", a: undefined, b: null, page: 0 });
    expect(url).toBe(`${DELCOM_BASEURL}/cash-flows?type=inflow&page=0`);
  });

  it("should return url without query string when all values are empty", () => {
    expect(buildUrl("/cash-flows", { label: "" })).toBe(`${DELCOM_BASEURL}/cash-flows`);
  });
});

describe("apiRequest", () => {
  it("should send GET request with bearer token", async () => {
    putAccessToken("token-1");
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success", message: "ok" }) });

    const result = await apiRequest("/users");

    expect(result).toEqual({ status: "success", message: "ok" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/users`);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer token-1");
    expect(init.body).toBeUndefined();
  });

  it("should not send Authorization header when there is no token", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success", message: "ok" }) });
    await apiRequest("/users");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("should not send Authorization header when auth is false", async () => {
    putAccessToken("token-1");
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success", message: "ok" }) });
    await apiRequest("/auth/login", { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("should serialize json body and send content type", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success", message: "ok" }) });
    await apiRequest("/cash-flows", { method: "POST", body: { label: "gaji" }, query: { x: 1 } });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/cash-flows?x=1`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ label: "gaji" }));
  });

  it("should pass FormData as is without content type", async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ status: "success", message: "ok" }) });
    const formData = new FormData();
    formData.append("photo", new File(["x"], "a.png"));

    await apiRequest("/users/me/photo", { method: "POST", body: formData });

    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(formData);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("should return error result when fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Network down"));
    const result = await apiRequest("/users");
    expect(result).toEqual({ status: "error", message: "Network down" });
  });
});
