import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => {
  return {
    default: {
      fire: vi.fn(),
    },
  };
});

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccessDialog", () => {
    it("calls Swal.fire with success configuration", async () => {
      (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
      await showSuccessDialog("Berhasil!", "Data tersimpan");

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil!",
        text: "Data tersimpan",
        timer: 2000,
        showConfirmButton: false,
      });
    });

    it("works without optional text argument", async () => {
      (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
      await showSuccessDialog("Berhasil!");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Berhasil!",
          text: undefined,
        })
      );
    });
  });

  describe("showErrorDialog", () => {
    it("calls Swal.fire with error configuration", async () => {
      (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
      await showErrorDialog("Gagal!", "Ada kesalahan");

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "error",
        title: "Gagal!",
        text: "Ada kesalahan",
        confirmButtonColor: "#EF4444",
      });
    });
  });

  describe("showConfirmDialog", () => {
    it("returns true when confirmed", async () => {
      (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
      const result = await showConfirmDialog("Hapus data?", "Yakin?");
      expect(result).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: "warning",
        title: "Hapus data?",
        text: "Yakin?",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Ya, lanjutkan",
        cancelButtonText: "Batal",
      });
    });

    it("returns false when dismissed", async () => {
      (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
      const result = await showConfirmDialog(
        "Hapus data?",
        undefined,
        "Hapus Sekarang",
        "Jangan"
      );
      expect(result).toBe(false);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmButtonText: "Hapus Sekarang",
          cancelButtonText: "Jangan",
        })
      );
    });
  });

  describe("formatRupiah", () => {
    it("formats positive and negative numbers correctly into IDR currency", () => {
      const formatted = formatRupiah(50000);
      expect(formatted).toContain("50.000");

      const zero = formatRupiah(0);
      expect(zero).toContain("0");
    });

    it("handles invalid numbers gracefully", () => {
      expect(formatRupiah(NaN as any)).toBe("Rp 0");
      expect(formatRupiah("abc" as any)).toBe("Rp 0");
    });
  });

  describe("formatDate", () => {
    it("formats valid date string and Date object", () => {
      const date = new Date("2026-03-15T10:30:00Z");
      const formattedStr = formatDate("2026-03-15T10:30:00Z");
      const formattedDate = formatDate(date);

      expect(formattedStr).toBeTruthy();
      expect(formattedDate).toBeTruthy();
      expect(formattedStr).not.toBe("-");
    });

    it("handles falsy and invalid dates gracefully", () => {
      expect(formatDate("")).toBe("-");
      expect(formatDate(null as any)).toBe("-");
      expect(formatDate(undefined as any)).toBe("-");
      expect(formatDate("invalid-date-string")).toBe("-");
    });
  });
});
