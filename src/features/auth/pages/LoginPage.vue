<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "~/hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { LogIn } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const emailInput = useInput("");
const passwordInput = useInput("");
const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  if (!emailInput.value.value || !passwordInput.value.value) {
    errorMessage.value = "Semua field harus diisi.";
    await showErrorDialog("Validasi Gagal", errorMessage.value);
    return;
  }

  try {
    await authStore.asyncLogin({
      email: emailInput.value.value,
      password: passwordInput.value.value,
    });
    await showSuccessDialog("Berhasil Masuk", "Selamat datang kembali!");
    router.push("/");
  } catch (error: any) {
    const msg = error?.message || "Gagal masuk ke akun.";
    errorMessage.value = msg;
    await showErrorDialog("Gagal Masuk", msg);
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5" data-testid="login-form">
    <div>
      <label for="login-email" class="block text-sm font-medium text-slate-300 mb-1">
        Email
      </label>
      <input
        id="login-email"
        type="email"
        :value="emailInput.value.value"
        @input="emailInput.onInput"
        placeholder="nama@delcom.org"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        data-testid="input-email"
        autocomplete="email"
      />
    </div>

    <div>
      <label for="login-password" class="block text-sm font-medium text-slate-300 mb-1">
        Kata Sandi
      </label>
      <input
        id="login-password"
        type="password"
        :value="passwordInput.value.value"
        @input="passwordInput.onInput"
        placeholder="••••••••"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        data-testid="input-password"
        autocomplete="current-password"
      />
    </div>

    <div v-if="errorMessage" class="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3" data-testid="error-message">
      {{ errorMessage }}
    </div>

    <button
      type="submit"
      :disabled="authStore.isAuthLogin"
      class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
      data-testid="btn-login"
    >
      <LogIn class="w-5 h-5" />
      <span>{{ authStore.isAuthLogin ? "Memproses..." : "Masuk" }}</span>
    </button>

    <div class="text-center pt-2">
      <p class="text-sm text-slate-400">
        Belum punya akun?
        <RouterLink to="/auth/register" class="text-sky-400 hover:text-sky-300 font-medium ml-1">
          Daftar di sini
        </RouterLink>
      </p>
    </div>
  </form>
</template>
