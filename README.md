# ifs24040-pabwe2026-sk-p5-nuxt

Tugas Praktikum 5 PABWE 2026 — **Delcom Cash Flow**: aplikasi pencatat arus kas pribadi berbasis Nuxt 4 (SPA), TypeScript, Pinia, dan Tailwind CSS v4.

Dokumentasi API: <https://open-api.delcom.org/docs/1.0/api-cash-flows>

## Cara Menjalankan

```bash
bun install
cp .env.example .env     # bila .env belum ada
bun run dev              # buka http://localhost:3000
bun run test:coverage    # vitest + laporan coverage (ambang 100%)
```

## Fitur

- **Autentikasi**: login & register dengan token Bearer yang tersimpan di `localStorage`.
- **Dashboard arus kas**: kartu ringkasan (saldo bersih, inflow, outflow, tunai, tabungan, pinjaman), filter berdasarkan jenis/sumber/label/rentang tanggal, tambah-ubah-hapus transaksi, dan reset semua data.
- **Detail transaksi**: informasi lengkap satu transaksi beserta aksi ubah/hapus.
- **Pengguna**: direktori seluruh pengguna dan halaman profil (ubah nama/email, unggah foto, ganti kata sandi).

## Struktur Kode

- `src/helpers/` — `apiHelper.ts` (wrapper fetch + token) dan `toolsHelper.ts` (dialog SweetAlert2, `formatRupiah`, `formatDate`)
- `src/hooks/useInput.ts` — composable untuk two-way binding input form
- `src/features/auth/` — API, store Pinia, layout, dan halaman login/register
- `src/features/users/` — API, store, halaman direktori pengguna dan profil
- `src/features/cashflows/` — API, store, navbar/sidebar, modal tambah/ubah, halaman dashboard dan detail
- `src/routes.ts` + `src/router.options.ts` — definisi rute; rute terproteksi dialihkan ke `/auth/login` bila belum ada token

## Catatan Teknis

- Permintaan API dari browser dilewatkan proxy same-origin `/api/delcom/**` (`server/api/delcom/[...path].ts`) menuju `VITE_DELCOM_BASEURL`, supaya terhindar dari masalah CORS di server Delcom. Set `VITE_DELCOM_DIRECT=true` lalu build ulang jika ingin memanggil API secara langsung.
- Ganti kata sandi memakai endpoint `PUT /users/password` sesuai dokumentasi Delcom.
- Proteksi rute dilakukan di `CashFlowLayout.vue` dan `AuthLayout.vue`.
