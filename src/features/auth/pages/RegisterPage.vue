<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "~/hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "~/helpers/toolsHelper";
import { UserPlus } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const nameInput = useInput("");
const emailInput = useInput("");
const passwordInput = useInput("");
const confirmPasswordInput = useInput("");
const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  if (
    !nameInput.value.value ||
    !emailInput.value.value ||
    !passwordInput.value.value ||
    !confirmPasswordInput.value.value
  ) {
    errorMessage.value = "Semua field harus diisi.";
    await showErrorDialog("Validasi Gagal", errorMessage.value);
    return;
  }

  if (passwordInput.value.value !== confirmPasswordInput.value.value) {
    errorMessage.value = "Konfirmasi kata sandi tidak cocok.";
    await showErrorDialog("Validasi Gagal", errorMessage.value);
    return;
  }

  try {
    await authStore.asyncRegister({
      name: nameInput.value.value,
      email: emailInput.value.value,
      password: passwordInput.value.value,
    });
    await showSuccessDialog("Pendaftaran Berhasil", "Silakan masuk dengan akun Anda.");
    router.push("/auth/login");
  } catch (error: any) {
    const msg = error?.message || "Gagal melakukan pendaftaran.";
    errorMessage.value = msg;
    await showErrorDialog("Pendaftaran Gagal", msg);
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4" data-testid="register-form">
    <div>
      <label for="register-name" class="block text-sm font-medium text-slate-300 mb-1">
        Nama Lengkap
      </label>
      <input
        id="register-name"
        type="text"
        :value="nameInput.value.value"
        @input="nameInput.onInput"
        placeholder="Rafael Nobel"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        data-testid="input-name"
        autocomplete="name"
      />
    </div>

    <div>
      <label for="register-email" class="block text-sm font-medium text-slate-300 mb-1">
        Email
      </label>
      <input
        id="register-email"
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
      <label for="register-password" class="block text-sm font-medium text-slate-300 mb-1">
        Kata Sandi
      </label>
      <input
        id="register-password"
        type="password"
        :value="passwordInput.value.value"
        @input="passwordInput.onInput"
        placeholder="••••••••"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        data-testid="input-password"
        autocomplete="new-password"
      />
    </div>

    <div>
      <label for="register-confirm-password" class="block text-sm font-medium text-slate-300 mb-1">
        Konfirmasi Kata Sandi
      </label>
      <input
        id="register-confirm-password"
        type="password"
        :value="confirmPasswordInput.value.value"
        @input="confirmPasswordInput.onInput"
        placeholder="••••••••"
        class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        data-testid="input-confirm-password"
        autocomplete="new-password"
      />
    </div>

    <div v-if="errorMessage" class="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3" data-testid="error-message">
      {{ errorMessage }}
    </div>

    <button
      type="submit"
      :disabled="authStore.isAuthRegister"
      class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
      data-testid="btn-register"
    >
      <UserPlus class="w-5 h-5" />
      <span>{{ authStore.isAuthRegister ? "Mendaftarkan..." : "Daftar Akun" }}</span>
    </button>

    <div class="text-center pt-2">
      <p class="text-sm text-slate-400">
        Sudah punya akun?
        <RouterLink to="/auth/login" class="text-sky-400 hover:text-sky-300 font-medium ml-1">
          Masuk di sini
        </RouterLink>
      </p>
    </div>
  </form>
</template>
