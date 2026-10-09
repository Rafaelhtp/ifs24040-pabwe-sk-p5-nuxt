<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { formatRupiah, formatDate, showConfirmDialog, showSuccessDialog, showErrorDialog } from "~/helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal.vue";
import {
  ArrowLeft,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  Clock,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const isChangeModalOpen = ref(false);

function getCashFlowId(): string {
  return String(route.params.cashFlowId || "");
}

async function loadDetail() {
  const id = getCashFlowId();
  if (!id) return;
  try {
    await cashFlowsStore.asyncGetCashFlowById(id);
  } catch (error: any) {
    showErrorDialog("Gagal Memuat Detail", error?.message || "Data transaksi tidak ditemukan.");
  }
}

function handleOpenEdit() {
  isChangeModalOpen.value = true;
}

async function handleDelete() {
  const id = getCashFlowId();
  if (!id) return;

  const confirmed = await showConfirmDialog(
    "Hapus Transaksi",
    "Apakah Anda yakin ingin menghapus data arus kas ini?",
    "Ya, Hapus",
    "Batal"
  );
  if (!confirmed) return;

  try {
    await cashFlowsStore.asyncDeleteCashFlow(id);
    showSuccessDialog("Berhasil Dihapus", "Data transaksi telah dihapus.");
    router.push("/");
  } catch (error: any) {
    showErrorDialog("Gagal Menghapus", error?.message || "Terjadi kesalahan saat menghapus data.");
  }
}

onMounted(() => {
  loadDetail();
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6" data-testid="detail-page">
    <!-- Back Button -->
    <div class="flex items-center justify-between">
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium"
        data-testid="btn-back"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </button>

      <div class="flex items-center gap-3">
        <button
          @click="handleOpenEdit"
          :disabled="!cashFlowsStore.cashFlow"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          data-testid="btn-detail-edit"
        >
          <Edit class="w-4 h-4" />
          <span>Ubah</span>
        </button>

        <button
          @click="handleDelete"
          :disabled="!cashFlowsStore.cashFlow"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-medium transition disabled:opacity-50"
          data-testid="btn-detail-delete"
        >
          <Trash2 class="w-4 h-4" />
          <span>Hapus</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cashFlowsStore.isLoadingCashFlow" class="py-20 text-center" data-testid="detail-loading">
      <div class="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs text-slate-400 mt-3">Memuat detail transaksi...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="!cashFlowsStore.cashFlow" class="py-20 text-center bg-slate-800/40 rounded-2xl border border-slate-800" data-testid="detail-not-found">
      <FileText class="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 class="text-base font-semibold text-slate-300">Data Transaksi Tidak Ditemukan</h3>
      <p class="text-xs text-slate-500 mt-1">Transaksi mungkin sudah dihapus atau ID tidak valid.</p>
    </div>

    <!-- Detail Card -->
    <div v-else class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm" data-testid="detail-card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-700/60 pb-6">
        <div>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            :class="
              cashFlowsStore.cashFlow.type === 'inflow'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            "
            data-testid="detail-badge"
          >
            <component :is="cashFlowsStore.cashFlow.type === 'inflow' ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
            {{ cashFlowsStore.cashFlow.type === 'inflow' ? 'Uang Masuk (Inflow)' : 'Uang Keluar (Outflow)' }}
          </span>

          <h2 class="text-2xl font-bold text-white tracking-tight" data-testid="detail-label">
            {{ cashFlowsStore.cashFlow.label }}
          </h2>
        </div>

        <div class="text-left sm:text-right">
          <p class="text-xs text-slate-400 font-medium">Nominal Transaksi</p>
          <p
            class="text-3xl font-extrabold tracking-tight mt-1"
            :class="cashFlowsStore.cashFlow.type === 'inflow' ? 'text-emerald-400' : 'text-rose-400'"
            data-testid="detail-nominal"
          >
            {{ formatRupiah(cashFlowsStore.cashFlow.nominal) }}
          </p>
        </div>
      </div>

      <!-- Attributes Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <CreditCard class="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <p class="text-xs text-slate-400">Sumber Rekening</p>
            <p class="text-sm font-semibold text-white capitalize mt-0.5" data-testid="detail-source">
              {{ cashFlowsStore.cashFlow.source }}
            </p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <Calendar class="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p class="text-xs text-slate-400">Tanggal Dibuat</p>
            <p class="text-sm font-semibold text-white mt-0.5" data-testid="detail-created-at">
              {{ formatDate(cashFlowsStore.cashFlow.created_at) }}
            </p>
          </div>
        </div>

        <div v-if="cashFlowsStore.cashFlow.updated_at" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <Clock class="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p class="text-xs text-slate-400">Terakhir Diperbarui</p>
            <p class="text-sm font-semibold text-white mt-0.5" data-testid="detail-updated-at">
              {{ formatDate(cashFlowsStore.cashFlow.updated_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description Block -->
      <div class="p-5 rounded-xl bg-slate-900/40 border border-slate-800">
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <FileText class="w-4 h-4 text-sky-400" />
          <span>Deskripsi & Catatan</span>
        </div>
        <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line" data-testid="detail-description">
          {{ cashFlowsStore.cashFlow.description || "Tidak ada deskripsi tambahan." }}
        </p>
      </div>
    </div>

    <!-- Edit Modal -->
    <ChangeModal
      :is-open="isChangeModalOpen"
      :cash-flow="cashFlowsStore.cashFlow"
      :on-close="() => (isChangeModalOpen = false)"
      :on-success="loadDetail"
    />
  </div>
</template>
