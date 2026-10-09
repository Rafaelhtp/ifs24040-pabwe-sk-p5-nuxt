import Swal from "sweetalert2";

export function showSuccessDialog(title: string, text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
}

export function showErrorDialog(title: string, text?: string) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#EF4444",
  });
}

export async function showConfirmDialog(
  title: string,
  text?: string,
  confirmButtonText = "Ya, lanjutkan",
  cancelButtonText = "Batal"
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#EF4444",
    cancelButtonColor: "#6B7280",
    confirmButtonText,
    cancelButtonText,
  });
  return Boolean(result.isConfirmed);
}

export function formatRupiah(value: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
