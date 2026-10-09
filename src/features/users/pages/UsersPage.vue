<script setup lang="ts">
import { onMounted } from "vue";
import { UserRound } from "lucide-vue-next";
import { resolvePhotoUrl } from "../../../helpers/toolsHelper";
import { useUsersStore } from "../states/usersStore";

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.asyncGetUsers();
});
</script>

<template>
  <section>
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold">Direktori Pengguna</h1>
      <p class="text-sm text-slate-500">Daftar semua pengguna yang terdaftar di Delcom Open API.</p>
    </header>

    <p v-if="usersStore.isUsers" data-testid="users-loading" class="text-slate-500">Memuat data pengguna...</p>
    <p v-else-if="usersStore.users.length === 0" data-testid="users-empty" class="text-slate-500">
      Belum ada pengguna.
    </p>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="users-list">
      <li
        v-for="user in usersStore.users"
        :key="user.id"
        class="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <img
          v-if="resolvePhotoUrl(user.photo)"
          :src="resolvePhotoUrl(user.photo)"
          :alt="user.name"
          width="48"
          height="48"
          loading="lazy"
          decoding="async"
          class="h-12 w-12 rounded-full object-cover" />
        <span v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <UserRound class="h-6 w-6" />
        </span>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
