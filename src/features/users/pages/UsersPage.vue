<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { Users, Mail, UserCheck, RefreshCw } from "lucide-vue-next";
import { showErrorDialog } from "~/helpers/toolsHelper";

const usersStore = useUsersStore();

async function loadUsers() {
  try {
    await usersStore.asyncGetUsers();
  } catch (error: any) {
    showErrorDialog("Gagal Memuat Pengguna", error?.message || "Tidak dapat memuat daftar pengguna.");
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="space-y-6" data-testid="users-page">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <Users class="w-7 h-7 text-sky-400" />
          Direktori Pengguna
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Daftar semua pengguna terdaftar dalam sistem Delcom Cash Flow
        </p>
      </div>

      <button
        @click="loadUsers"
        :disabled="usersStore.isLoadingUsers"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition disabled:opacity-50"
        data-testid="btn-refresh-users"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': usersStore.isLoadingUsers }" />
        Muat Ulang
      </button>
    </div>

    <div v-if="usersStore.isLoadingUsers" class="flex justify-center py-16" data-testid="users-loading">
      <div class="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="usersStore.users.length === 0" class="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800" data-testid="users-empty">
      <UserCheck class="w-12 h-12 text-slate-500 mx-auto mb-3" />
      <p class="text-slate-400 font-medium">Belum ada data pengguna lain.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="users-list">
      <div
        v-for="user in usersStore.users"
        :key="user.id"
        class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-sky-500/50 transition flex items-start gap-4 shadow-sm"
        data-testid="user-card"
      >
        <div class="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
          <img
            v-if="user.photo"
            :src="user.photo"
            :alt="user.name"
            class="w-full h-full object-cover"
            data-testid="user-photo"
          />
          <span v-else>{{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-white truncate" data-testid="user-name">
            {{ user.name }}
          </h3>
          <p class="text-sm text-slate-400 flex items-center gap-1.5 mt-1 truncate" data-testid="user-email">
            <Mail class="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span class="truncate">{{ user.email }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
