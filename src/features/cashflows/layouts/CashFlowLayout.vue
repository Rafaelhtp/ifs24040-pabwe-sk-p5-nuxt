<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const isSidebarOpen = ref(false);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col" data-testid="cashflow-layout">
    <NavbarComponent :on-toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex overflow-hidden">
      <SidebarComponent :is-open="isSidebarOpen" :on-close="closeSidebar" />

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" data-testid="layout-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
