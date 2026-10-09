<script setup lang="ts">
import { RouterLink } from "vue-router";
import { FileQuestion, Home } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6" data-testid="not-found-page">
    <div class="text-center max-w-md p-8 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700/60 shadow-2xl">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mb-4 ring-1 ring-rose-500/20">
        <FileQuestion class="w-8 h-8" />
      </div>
      <h1 class="text-6xl font-extrabold text-white mb-2">404</h1>
      <h2 class="text-2xl font-bold text-slate-200 mb-3">Halaman Tidak Ditemukan</h2>
      <p class="text-slate-400 text-sm mb-6">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium shadow-lg shadow-sky-500/20 transition"
        data-testid="btn-back-home"
      >
        <Home class="w-4 h-4" />
        Kembali ke Beranda
      </RouterLink>
    </div>
  </div>
</template>
