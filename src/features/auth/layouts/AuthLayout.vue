<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { CircleDollarSign, TrendingUp, ShieldCheck, PiggyBank } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  // Pengguna yang sudah login tidak perlu melihat halaman auth lagi
  if (authStore.isAuthenticated) {
    router.replace("/");
  }
});

const highlights = [
  { icon: TrendingUp, text: "Pantau pemasukan & pengeluaran secara real-time" },
  { icon: PiggyBank, text: "Kelola saldo tunai, tabungan, dan pinjaman" },
  { icon: ShieldCheck, text: "Data kamu tersimpan aman di akun pribadi" },
];
</script>

<template>
  <main class="flex min-h-screen bg-teal-950">
    <!-- Panel branding (desktop) -->
    <section class="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-teal-900 via-teal-950 to-emerald-950 p-12 text-white lg:flex">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-400 text-white shadow-lg">
          <CircleDollarSign class="h-6 w-6" />
        </span>
        <span class="text-xl font-extrabold tracking-tight">Delcom Cash Flow</span>
      </div>

      <div>
        <h2 class="text-4xl font-extrabold leading-tight">
          Uang masuk, uang keluar,<br />semua tercatat rapi.
        </h2>
        <ul class="mt-8 space-y-4">
          <li v-for="item in highlights" :key="item.text" class="flex items-center gap-3 text-teal-100">
            <component :is="item.icon" class="h-5 w-5 text-emerald-400" />
            <span class="text-sm font-medium">{{ item.text }}</span>
          </li>
        </ul>
      </div>

      <p class="text-xs text-teal-300">Delcom Cash Flow — PABWE 2026</p>
    </section>

    <!-- Panel form -->
    <section class="flex flex-1 items-center justify-center bg-stone-50 px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center lg:hidden">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-lg">
            <CircleDollarSign class="h-7 w-7" />
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Delcom Cash Flow</h1>
          <p class="mt-1 text-sm text-slate-500">Catat arus kas pribadimu dengan mudah</p>
        </div>

        <div class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200 sm:p-8">
          <nav class="mb-6 grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1 text-center text-sm font-semibold">
            <RouterLink
              to="/auth/login"
              data-testid="tab-login"
              class="rounded-full py-2 text-slate-600"
              active-class="bg-teal-600 text-white shadow">
              Masuk
            </RouterLink>
            <RouterLink
              to="/auth/register"
              data-testid="tab-register"
              class="rounded-full py-2 text-slate-600"
              active-class="bg-teal-600 text-white shadow">
              Buat Akun
            </RouterLink>
          </nav>

          <RouterView />
        </div>
      </div>
    </section>
  </main>
</template>
