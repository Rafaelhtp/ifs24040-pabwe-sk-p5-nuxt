<script setup lang="ts">
import { useRouter } from "vue-router";
import { LogOut, Menu, CircleDollarSign } from "lucide-vue-next";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

async function onLogout() {
  const confirmed = await showConfirmDialog("Yakin mau keluar?", "Kamu harus masuk lagi untuk mengakses datamu.");
  if (!confirmed) {
    return;
  }
  await authStore.asyncSetIsAuthLogout();
  router.replace("/auth/login");
}
</script>

<template>
  <header class="sticky top-0 z-20 flex items-center justify-between bg-teal-950 px-4 py-3 text-white shadow-md">
    <div class="flex items-center gap-3">
      <button
        type="button"
        data-testid="navbar-toggle"
        aria-label="Buka menu"
        class="rounded-lg p-1 hover:bg-teal-900 lg:hidden"
        @click="emit('toggle-sidebar')">
        <Menu class="h-5 w-5" />
      </button>
      <div class="flex items-center gap-2 font-extrabold tracking-tight">
        <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 text-white">
          <CircleDollarSign class="h-4 w-4" />
        </span>
        Delcom Cash Flow
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="hidden text-right sm:block" data-testid="navbar-identity">
        <p class="text-sm font-semibold">{{ usersStore.profile?.name }}</p>
        <p class="text-xs text-teal-300">{{ usersStore.profile?.email }}</p>
      </div>
      <button
        type="button"
        data-testid="navbar-logout"
        :disabled="authStore.isAuthLogout"
        class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
        @click="onLogout">
        <LogOut class="h-4 w-4" /> Keluar
      </button>
    </div>
  </header>
</template>
