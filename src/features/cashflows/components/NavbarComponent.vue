<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useUsersStore } from "~/features/users/states/usersStore";
import { showConfirmDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { LogOut, Menu, User as UserIcon } from "lucide-vue-next";

defineProps<{
  onToggleSidebar?: () => void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const displayName = computed(() => usersStore.profile?.name || authStore.user?.name || "Pengguna");
const displayEmail = computed(() => usersStore.profile?.email || authStore.user?.email || "Delcom User");
const displayPhoto = computed(() => usersStore.profile?.photo || authStore.user?.avatar || null);
const userInitial = computed(() => displayName.value.charAt(0).toUpperCase());

async function handleLogout() {
  const confirmed = await showConfirmDialog(
    "Konfirmasi Keluar",
    "Apakah Anda yakin ingin keluar dari akun Delcom Cash Flow?",
    "Ya, Keluar",
    "Batal"
  );
  if (!confirmed) return;

  await authStore.asyncLogout();
  await showSuccessDialog("Berhasil Keluar", "Anda telah keluar dari aplikasi.");
  router.push("/auth/login");
}
</script>

<template>
  <header class="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-30" data-testid="navbar">
    <div class="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="onToggleSidebar?.()"
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 lg:hidden transition"
          data-testid="btn-toggle-sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <span class="text-base font-bold text-white tracking-tight hidden sm:inline">
            Delcom Cash Flow
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Active User Info -->
        <div class="flex items-center gap-3" data-testid="navbar-user-info">
          <div class="w-9 h-9 rounded-xl bg-slate-700 text-sky-400 flex items-center justify-center font-semibold overflow-hidden border border-slate-600">
            <img
              v-if="displayPhoto"
              :src="displayPhoto"
              alt="Avatar"
              width="36"
              height="36"
              class="w-full h-full object-cover"
              data-testid="navbar-user-avatar"
            />
            <span v-else data-testid="navbar-user-initial">
              {{ userInitial }}
            </span>
          </div>

          <div class="hidden md:block text-left">
            <p class="text-sm font-semibold text-white leading-tight" data-testid="navbar-user-name">
              {{ displayName }}
            </p>
            <p class="text-xs text-slate-400 leading-tight mt-0.5" data-testid="navbar-user-email">
              {{ displayEmail }}
            </p>
          </div>
        </div>

        <!-- Logout Button -->
        <button
          @click="handleLogout"
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-medium transition"
          data-testid="btn-logout"
          title="Keluar dari akun"
        >
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </header>
</template>
