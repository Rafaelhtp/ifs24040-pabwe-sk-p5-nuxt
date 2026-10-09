// SweetAlert2 di-import secara dinamis supaya tidak ikut di bundle awal
async function loadSwal() {
  return (await import("sweetalert2")).default;
}

export const SOURCE_LABELS: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const TYPE_LABELS: Record<string, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

export async function showSuccessDialog(message: string) {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1800,
    showConfirmButton: false,
  });
}

export async function showErrorDialog(message: string) {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
  });
}

export async function showConfirmDialog(title: string, text: string): Promise<boolean> {
  const Swal = await loadSwal();
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#0d9488",
  });
  return result.isConfirmed;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Foto profil dari API dapat berbentuk URL absolut maupun path relatif (img/profile/...). */
export function resolvePhotoUrl(photo?: string | null): string {
  if (!photo) {
    return "";
  }
  if (photo.startsWith("http")) {
    return photo;
  }
  return `${DELCOM_ORIGIN}/${photo}`;
}
