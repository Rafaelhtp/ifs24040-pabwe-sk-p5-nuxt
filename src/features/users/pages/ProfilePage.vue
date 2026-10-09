<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Camera, KeyRound, Save, UserRound } from "lucide-vue-next";
import { showErrorDialog, resolvePhotoUrl } from "../../../helpers/toolsHelper";
import { useInput } from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";

const usersStore = useUsersStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange, resetPassword] = useInput("");
const [newPassword, onNewPasswordChange, resetNewPassword] = useInput("");
const [confirmPassword, onConfirmPasswordChange, resetConfirmPassword] = useInput("");
const photoFile = ref<File | null>(null);

// Sinkronkan isian form dengan data profil terbaru
watch(
  () => usersStore.profile,
  (profile) => {
    name.value = profile.name;
    email.value = profile.email;
  }
);

onMounted(async () => {
  await usersStore.asyncGetProfile();
});

function onPhotoSelected(event: Event) {
  photoFile.value = (event.target as HTMLInputElement).files[0];
}

async function onSubmitProfile() {
  await usersStore.asyncChangeProfile({ name: name.value, email: email.value });
}

async function onSubmitPhoto() {
  const success = await usersStore.asyncChangePhoto(photoFile.value);
  if (success) {
    photoFile.value = null;
    await usersStore.asyncGetProfile();
  }
}

async function onSubmitPassword() {
  if (newPassword.value !== confirmPassword.value) {
    await showErrorDialog("Konfirmasi kata sandi baru tidak sesuai.");
    return;
  }
  const success = await usersStore.asyncChangePassword({
    password: password.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmPassword.value,
  });
  if (success) {
    resetPassword();
    resetNewPassword();
    resetConfirmPassword();
  }
}
</script>

<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-extrabold">Profil Saya</h1>
      <p class="text-sm text-slate-500">Perbarui data akun, foto profil, dan kata sandimu.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Foto profil -->
      <form class="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100" data-testid="photo-form" @submit.prevent="onSubmitPhoto">
        <img
          v-if="usersStore.profile && resolvePhotoUrl(usersStore.profile.photo)"
          :src="resolvePhotoUrl(usersStore.profile.photo)"
          alt="Foto profil"
          class="mx-auto h-28 w-28 rounded-full object-cover" />
        <span v-else class="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <UserRound class="h-12 w-12" />
        </span>
        <input type="file" accept="image/*" aria-label="Pilih foto profil" data-testid="photo-input" class="mt-4 block w-full text-sm" @change="onPhotoSelected" />
        <button
          type="submit"
          :disabled="!photoFile || usersStore.isPhotoChange"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <Camera class="h-4 w-4" /> Ganti Foto
        </button>
      </form>

      <!-- Data profil -->
      <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" data-testid="profile-form" @submit.prevent="onSubmitProfile">
        <h2 class="font-bold">Informasi Akun</h2>
        <div>
          <label for="profile-name" class="mb-1 block text-xs font-bold uppercase text-slate-500">Nama</label>
          <input id="profile-name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" :value="name" @input="onNameChange" />
        </div>
        <div>
          <label for="profile-email" class="mb-1 block text-xs font-bold uppercase text-slate-500">Email</label>
          <input id="profile-email" type="email" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" :value="email" @input="onEmailChange" />
        </div>
        <button
          type="submit"
          :disabled="usersStore.isProfileChange"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <Save class="h-4 w-4" /> Simpan
        </button>
      </form>

      <!-- Ganti password -->
      <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" data-testid="password-form" @submit.prevent="onSubmitPassword">
        <h2 class="font-bold">Ubah Kata Sandi</h2>
        <input type="password" aria-label="Kata sandi saat ini" placeholder="Kata sandi saat ini" data-testid="password-current" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" :value="password" @input="onPasswordChange" />
        <input type="password" aria-label="Kata sandi baru" placeholder="Kata sandi baru" data-testid="password-new" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" :value="newPassword" @input="onNewPasswordChange" />
        <input type="password" aria-label="Konfirmasi kata sandi baru" placeholder="Konfirmasi kata sandi baru" data-testid="password-confirm" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" :value="confirmPassword" @input="onConfirmPasswordChange" />
        <button
          type="submit"
          :disabled="usersStore.isPasswordChange"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          <KeyRound class="h-4 w-4" /> Ubah Kata Sandi
        </button>
      </form>
    </div>
  </section>
</template>
