<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, useRoute, RouterView } from "vue-router";
import { checkAuthNavigation } from "./routes";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  const redirectTarget = checkAuthNavigation(route.path);
  if (redirectTarget) {
    router.replace(redirectTarget);
  }
});
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
    <RouterView />
  </div>
</template>
