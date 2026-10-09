<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn, Mail, Lock } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const error = ref("");

async function onSubmit() {
  if (!email.value || !password.value) {
    error.value = "Email dan kata sandi tidak boleh kosong.";
    return;
  }
  error.value = "";

  const success = await authStore.asyncSetIsAuthLogin({
    email: email.value,
    password: password.value,
  });
  if (success) {
    router.push("/");
  }
}
</script>

<template>
  <form class="space-y-5" data-testid="login-form" @submit.prevent="onSubmit">
    <div>
      <label for="login-email-input" class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Alamat Email</label>
      <div class="relative">
        <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          id="login-email-input"
          name="email"
          autocomplete="username"
          type="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
          :value="email"
          @input="onEmailChange" />
      </div>
    </div>

    <div>
      <label for="login-password-input" class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Kata Sandi</label>
      <div class="relative">
        <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          id="login-password-input"
          name="password"
          autocomplete="current-password"
          type="password"
          placeholder="••••••••"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
          :value="password"
          @input="onPasswordChange" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-rose-700" data-testid="login-error">{{ error }}</p>

    <button
      id="login-submit-button"
      type="submit"
      :disabled="authStore.isAuthLogin"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-teal-700 disabled:opacity-60">
      <LogIn class="h-4 w-4" />
      {{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}
    </button>
  </form>
</template>
