<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router";
import { LayoutDashboard, Users, User, X } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
  onClose?: () => void;
}>();

const route = useRoute();

const navigation = [
  {
    name: "Ringkasan Arus Kas",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Direktori Pengguna",
    href: "/users",
    icon: Users,
    exact: false,
  },
  {
    name: "Profil Saya",
    href: "/profile",
    icon: User,
    exact: false,
  },
];

function isCurrent(href: string, exact: boolean): boolean {
  if (exact) {
    return route.path === href;
  }
  return route.path.startsWith(href);
}
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
      @click="onClose?.()"
      data-testid="sidebar-backdrop"
    />

    <!-- Sidebar Drawer -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0"
      :class="{
        'translate-x-0': isOpen,
        '-translate-x-full': !isOpen,
      }"
      data-testid="sidebar"
    >
      <!-- Sidebar Header -->
      <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <span class="font-bold text-white text-base">Delcom Cash Flow</span>
        </div>

        <button
          @click="onClose?.()"
          class="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          data-testid="btn-close-sidebar"
          aria-label="Tutup Menu"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-4 py-6 space-y-1.5" data-testid="sidebar-navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          @click="onClose?.()"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition"
          :class="{
            'bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-semibold': isCurrent(item.href, item.exact),
            'text-slate-400 hover:text-white hover:bg-slate-800/60': !isCurrent(item.href, item.exact),
          }"
          :data-testid="`nav-link-${item.href.replace('/', '') || 'home'}`"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- App Info Footer -->
      <div class="p-4 border-t border-slate-800/80">
        <div class="bg-slate-800/40 rounded-xl p-3 border border-slate-800">
          <p class="text-xs font-semibold text-slate-300">PABWE 2026 - P5</p>
          <p class="text-[11px] text-slate-500 mt-0.5">NIM: IFS24040</p>
        </div>
      </div>
    </aside>
  </div>
</template>
