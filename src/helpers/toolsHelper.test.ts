import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatRupiah,
  resolvePhotoUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  fire.mockReset();
});

describe("dialogs", () => {
  it("should show success dialog", async () => {
    fire.mockResolvedValue({});
    await showSuccessDialog("Tersimpan");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Tersimpan" }));
  });

  it("should show error dialog", async () => {
    fire.mockResolvedValue({});
    await showErrorDialog("Gagal!");
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal!" }));
  });

  it("should resolve true when confirm dialog is confirmed", async () => {
    fire.mockResolvedValue({ isConfirmed: true });
    await expect(showConfirmDialog("Hapus?", "Yakin?")).resolves.toBe(true);
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", title: "Hapus?", text: "Yakin?" }));
  });

  it("should resolve false when confirm dialog is cancelled", async () => {
    fire.mockResolvedValue({ isConfirmed: false });
    await expect(showConfirmDialog("Hapus?", "Yakin?")).resolves.toBe(false);
  });
});

describe("formatters", () => {
  it("should format number as rupiah", () => {
    const text = formatRupiah(2500000).replace(/\s/g, " ");
    expect(text).toContain("Rp");
    expect(text).toContain("2.500.000");
  });

  it("should format date string", () => {
    const text = formatDate("2024-10-05T12:09:16.000000Z");
    expect(text).toContain("2024");
  });
});

describe("resolvePhotoUrl", () => {
  it("should return empty string when photo is empty", () => {
    expect(resolvePhotoUrl(null)).toBe("");
    expect(resolvePhotoUrl(undefined)).toBe("");
  });

  it("should keep absolute url", () => {
    expect(resolvePhotoUrl("http://x.test/a.png")).toBe("http://x.test/a.png");
  });

  it("should prefix relative path with api origin", () => {
    expect(resolvePhotoUrl("img/profile/1.png")).toBe(`${DELCOM_ORIGIN}/img/profile/1.png`);
  });
});
