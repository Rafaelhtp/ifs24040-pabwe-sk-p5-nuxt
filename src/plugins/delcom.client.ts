/**
 * Browser memanggil API lewat proxy same-origin (/api/delcom → server/api/delcom/[...path].ts).
 * apiHelper membaca globalThis.DELCOM_BASEURL pada setiap request.
 * Set VITE_DELCOM_DIRECT=true (lalu build ulang) untuk memanggil Delcom langsung.
 */
export default defineNuxtPlugin(() => {
  const direct = import.meta.env.VITE_DELCOM_DIRECT === "true";
  if (!direct) {
    (globalThis as any).DELCOM_BASEURL = "/api/delcom";
  }
});
