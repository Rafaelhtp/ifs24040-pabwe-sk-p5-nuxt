import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

const apiRequestMock = apiRequest as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  apiRequestMock.mockReset();
  apiRequestMock.mockResolvedValue({ status: "success", message: "ok" });
});

describe("userApi", () => {
  it("getUsers should call /users", async () => {
    await getUsers();
    expect(apiRequestMock).toHaveBeenCalledWith("/users");
  });

  it("getMe should call /users/me", async () => {
    await getMe();
    expect(apiRequestMock).toHaveBeenCalledWith("/users/me");
  });

  it("putMe should send profile payload", async () => {
    const payload = { name: "A", email: "a@b.c" };
    await putMe(payload);
    expect(apiRequestMock).toHaveBeenCalledWith("/users/me", { method: "PUT", body: payload });
  });

  it("postPhoto should upload file as FormData", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await postPhoto(file);

    const [path, options] = apiRequestMock.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("photo")).toBeInstanceOf(File);
  });

  it("putPassword should send password payload", async () => {
    const payload = { password: "a", new_password: "b", new_password_confirmation: "b" };
    await putPassword(payload);
    expect(apiRequestMock).toHaveBeenCalledWith("/users/password", { method: "PUT", body: payload });
  });
});
