<script setup lang="ts">
import { RouterLink } from "vue-router";
import { LayoutDashboard, UserRound, Users, X } from "lucide-vue-next";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const menus = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard },
  { to: "/users", label: "Direktori Pengguna", icon: Users },
  { to: "/profile", label: "Profil Saya", icon: UserRound },
];
</script>

<template>
  <div
    v-if="open"
    data-testid="sidebar-backdrop"
    class="fixed inset-0 z-30 bg-teal-950/50 backdrop-blur-sm lg:hidden"
    @click="emit('close')" />

  <aside
    data-testid="sidebar"
    class="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full bg-white p-4 shadow-xl transition-transform lg:static lg:translate-x-0 lg:rounded-2xl lg:shadow-sm lg:ring-1 lg:ring-stone-200"
    :class="{ 'translate-x-0': open }">
    <div class="mb-6 flex items-center justify-between lg:hidden">
      <span class="font-extrabold text-slate-900">Navigasi</span>
      <button type="button" data-testid="sidebar-close" aria-label="Tutup menu" @click="emit('close')">
        <X class="h-5 w-5" />
      </button>
    </div>

    <nav class="space-y-1">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        exact-active-class="bg-teal-600 text-white shadow-sm"
        class="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-700"
        @click="emit('close')">
        <component :is="menu.icon" class="h-4 w-4" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
