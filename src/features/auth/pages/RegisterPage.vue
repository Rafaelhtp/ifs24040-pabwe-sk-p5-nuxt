<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { UserPlus, User, Mail, Lock } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const error = ref("");

async function onSubmit() {
  if (!name.value || !email.value || !password.value) {
    error.value = "Nama, email, dan kata sandi wajib diisi.";
    return;
  }
  if (password.value.length < 6) {
    error.value = "Kata sandi minimal 6 karakter.";
    return;
  }
  error.value = "";

  const success = await authStore.asyncSetIsAuthRegister({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  if (success) {
    router.push("/auth/login");
  }
}
</script>

<template>
  <form class="space-y-5" data-testid="register-form" @submit.prevent="onSubmit">
    <div>
      <label for="name" class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Nama Lengkap</label>
      <div class="relative">
        <User class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          id="name"
          type="text"
          placeholder="Nama lengkap"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
          :value="name"
          @input="onNameChange" />
      </div>
    </div>

    <div>
      <label for="email" class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Alamat Email</label>
      <div class="relative">
        <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          id="email"
          type="email"
          placeholder="nama@email.com"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
          :value="email"
          @input="onEmailChange" />
      </div>
    </div>

    <div>
      <label for="password" class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Kata Sandi</label>
      <div class="relative">
        <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <input
          id="password"
          type="password"
          placeholder="Minimal 6 karakter"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
          :value="password"
          @input="onPasswordChange" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-rose-700" data-testid="register-error">{{ error }}</p>

    <button
      type="submit"
      :disabled="authStore.isAuthRegister"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-teal-700 disabled:opacity-60">
      <UserPlus class="h-4 w-4" />
      {{ authStore.isAuthRegister ? "Memproses..." : "Daftar Sekarang" }}
    </button>
  </form>
</template>
