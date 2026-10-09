import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
import { postLogin, postLogout, postRegister } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

const apiRequestMock = apiRequest as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiRequestMock.mockReset();
  apiRequestMock.mockResolvedValue({ status: "success", message: "ok" });
});

describe("authApi", () => {
  it("postLogin should call /auth/login without auth", async () => {
    const payload = { email: "a@b.c", password: "123456" };
    await expect(postLogin(payload)).resolves.toEqual({ status: "success", message: "ok" });
    expect(apiRequestMock).toHaveBeenCalledWith("/auth/login", { method: "POST", body: payload, auth: false });
  });

  it("postRegister should call /auth/register without auth", async () => {
    const payload = { name: "A", email: "a@b.c", password: "123456" };
    await postRegister(payload);
    expect(apiRequestMock).toHaveBeenCalledWith("/auth/register", { method: "POST", body: payload, auth: false });
  });

  it("postLogout should call /auth/logout", async () => {
    await postLogout();
    expect(apiRequestMock).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
