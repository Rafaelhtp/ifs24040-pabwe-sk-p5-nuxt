<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useAuthStore } from "~/features/auth/states/authStore";
import { useInput } from "~/hooks/useInput";
import { showSuccessDialog, showErrorDialog } from "~/helpers/toolsHelper";
import { User, Lock, Upload, Save, KeyRound } from "lucide-vue-next";

const usersStore = useUsersStore();
const authStore = useAuthStore();

const nameInput = useInput("");
const currentPasswordInput = useInput("");
const newPasswordInput = useInput("");
const confirmNewPasswordInput = useInput("");

const fileInputRef = ref<HTMLInputElement | null>(null);

async function loadProfile() {
  try {
    const profile = await usersStore.asyncGetProfile();
    if (profile?.name) {
      nameInput.setValue(profile.name);
    }
  } catch (error: any) {
    showErrorDialog("Gagal Memuat Profil", error?.message || "Tidak dapat memuat profil pengguna.");
  }
}

async function handleUpdateProfile() {
  if (!nameInput.value.value.trim()) {
    showErrorDialog("Validasi Gagal", "Nama tidak boleh kosong.");
    return;
  }
  try {
    await usersStore.asyncUpdateProfile({ name: nameInput.value.value });
    if (authStore.user) {
      authStore.user.name = nameInput.value.value;
    }
    showSuccessDialog("Profil Diperbarui", "Nama pengguna berhasil disimpan.");
  } catch (error: any) {
    showErrorDialog("Gagal Memperbarui Profil", error?.message || "Terjadi kesalahan.");
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  try {
    const newPhotoUrl = await usersStore.asyncUploadPhoto(file);
    if (authStore.user) {
      authStore.user.avatar = newPhotoUrl;
    }
    showSuccessDialog("Foto Diperbarui", "Foto profil berhasil diunggah.");
  } catch (error: any) {
    showErrorDialog("Gagal Mengunggah Foto", error?.message || "Tidak dapat mengunggah foto.");
  }
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleChangePassword() {
  if (
    !currentPasswordInput.value.value ||
    !newPasswordInput.value.value ||
    !confirmNewPasswordInput.value.value
  ) {
    showErrorDialog("Validasi Gagal", "Semua kolom kata sandi harus diisi.");
    return;
  }

  if (newPasswordInput.value.value !== confirmNewPasswordInput.value.value) {
    showErrorDialog("Validasi Gagal", "Konfirmasi kata sandi baru tidak cocok.");
    return;
  }

  try {
    await usersStore.asyncChangePassword({
      current_password: currentPasswordInput.value.value,
      password: newPasswordInput.value.value,
      confirm_password: confirmNewPasswordInput.value.value,
    });
    currentPasswordInput.setValue("");
    newPasswordInput.setValue("");
    confirmNewPasswordInput.setValue("");
    showSuccessDialog("Kata Sandi Berhasil Diubah", "Silakan gunakan kata sandi baru Anda saat login.");
  } catch (error: any) {
    showErrorDialog("Gagal Mengubah Kata Sandi", error?.message || "Kata sandi lama salah atau tidak valid.");
  }
}

onMounted(() => {
  loadProfile();
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8" data-testid="profile-page">
    <div>
      <h1 class="text-2xl font-bold text-white flex items-center gap-2">
        <User class="w-7 h-7 text-sky-400" />
        Profil Saya
      </h1>
      <p class="text-sm text-slate-400 mt-1">
        Kelola informasi akun, foto profil, dan kata sandi Anda
      </p>
    </div>

    <!-- Avatar & Info Card -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
      <div class="relative group">
        <div class="w-24 h-24 rounded-2xl bg-sky-500/20 text-sky-400 border-2 border-sky-500/30 flex items-center justify-center font-bold text-3xl overflow-hidden shadow-inner">
          <img
            v-if="usersStore.profile?.photo"
            :src="usersStore.profile.photo"
            alt="Avatar"
            class="w-full h-full object-cover"
            data-testid="profile-avatar-img"
          />
          <span v-else data-testid="profile-avatar-fallback">
            {{ usersStore.profile?.name ? usersStore.profile.name.charAt(0).toUpperCase() : 'U' }}
          </span>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
          data-testid="file-avatar-input"
          aria-label="Pilih foto profil"
        />

        <button
          @click="triggerFileInput"
          :disabled="usersStore.isUploadingPhoto"
          class="absolute -bottom-2 -right-2 p-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl shadow-lg transition disabled:opacity-50"
          data-testid="btn-upload-avatar"
          title="Ubah Foto Profil"
          aria-label="Ubah Foto Profil"
        >
          <Upload class="w-4 h-4" />
        </button>
      </div>

      <div class="text-center sm:text-left flex-1 min-w-0">
        <h2 class="text-xl font-bold text-white truncate" data-testid="profile-display-name">
          {{ usersStore.profile?.name || "Pengguna" }}
        </h2>
        <p class="text-sm text-slate-400 mt-1 truncate" data-testid="profile-display-email">
          {{ usersStore.profile?.email || "-" }}
        </p>
        <span class="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Akun Aktif
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Edit Profile Card -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-5">
        <div class="border-b border-slate-700/60 pb-3 flex items-center gap-2">
          <User class="w-5 h-5 text-sky-400" />
          <h3 class="text-base font-semibold text-white">Ubah Informasi Pribadi</h3>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4" data-testid="form-update-profile">
          <div>
            <label for="profile-name" class="block text-sm font-medium text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <input
              id="profile-name"
              type="text"
              :value="nameInput.value.value"
              @input="nameInput.onInput"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              data-testid="input-profile-name"
            />
          </div>

          <div>
            <label for="profile-email" class="block text-sm font-medium text-slate-300 mb-1">
              Email (Tidak dapat diubah)
            </label>
            <input
              id="profile-email"
              type="email"
              :value="usersStore.profile?.email || ''"
              disabled
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-slate-500 cursor-not-allowed"
              data-testid="input-profile-email-disabled"
            />
          </div>

          <button
            type="submit"
            :disabled="usersStore.isUpdatingProfile"
            class="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
            data-testid="btn-save-profile"
          >
            <Save class="w-4 h-4" />
            <span>{{ usersStore.isUpdatingProfile ? "Menyimpan..." : "Simpan Profil" }}</span>
          </button>
        </form>
      </div>

      <!-- Change Password Card -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-5">
        <div class="border-b border-slate-700/60 pb-3 flex items-center gap-2">
          <KeyRound class="w-5 h-5 text-amber-400" />
          <h3 class="text-base font-semibold text-white">Ganti Kata Sandi</h3>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4" data-testid="form-change-password">
          <div>
            <label for="current-password" class="block text-sm font-medium text-slate-300 mb-1">
              Kata Sandi Saat Ini
            </label>
            <input
              id="current-password"
              type="password"
              :value="currentPasswordInput.value.value"
              @input="currentPasswordInput.onInput"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              data-testid="input-current-password"
            />
          </div>

          <div>
            <label for="new-password" class="block text-sm font-medium text-slate-300 mb-1">
              Kata Sandi Baru
            </label>
            <input
              id="new-password"
              type="password"
              :value="newPasswordInput.value.value"
              @input="newPasswordInput.onInput"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              data-testid="input-new-password"
            />
          </div>

          <div>
            <label for="confirm-new-password" class="block text-sm font-medium text-slate-300 mb-1">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              id="confirm-new-password"
              type="password"
              :value="confirmNewPasswordInput.value.value"
              @input="confirmNewPasswordInput.onInput"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              data-testid="input-confirm-new-password"
            />
          </div>

          <button
            type="submit"
            :disabled="usersStore.isChangingPassword"
            class="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            data-testid="btn-save-password"
          >
            <Lock class="w-4 h-4" />
            <span>{{ usersStore.isChangingPassword ? "Mengubah..." : "Perbarui Kata Sandi" }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
