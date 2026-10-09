<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 text-center">
    <p class="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-7xl font-extrabold text-transparent">404</p>
    <h1 class="mt-4 text-2xl font-bold text-slate-900">Ups, halaman tidak ditemukan</h1>
    <p class="mt-2 text-slate-500">Alamat yang kamu tuju tidak tersedia atau sudah dipindahkan.</p>
    <RouterLink to="/home" class="mt-6 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-700">
      Kembali ke Beranda
    </RouterLink>
  </main>
</template>
