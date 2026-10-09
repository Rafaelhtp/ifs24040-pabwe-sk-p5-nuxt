<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const isSidebarOpen = ref(false);

onMounted(() => {
  // Halaman ini hanya untuk pengguna yang sudah login
  if (!authStore.isAuthenticated) {
    router.replace("/auth/login");
    return;
  }
  usersStore.asyncGetProfile();
});
</script>

<template>
  <div class="min-h-screen bg-stone-100">
    <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />
      <main class="min-w-0 flex-1">
        <!-- Halaman anak hanya dirender setelah login, agar tidak memanggil API tanpa token -->
        <RouterView v-if="authStore.isAuthenticated" />
      </main>
    </div>
  </div>
</template>
