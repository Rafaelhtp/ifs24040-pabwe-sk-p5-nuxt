<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { formatRupiah, formatDate, showConfirmDialog, showSuccessDialog, showErrorDialog } from "~/helpers/toolsHelper";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import type { CashFlow, CashFlowType, CashFlowSource, CashFlowQueryParams } from "../api/cashFlowApi";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  CreditCard,
  Plus,
  Trash2,
  Filter,
  Eye,
  Edit2,
  Calendar,
  Layers,
  ArrowUpDown,
} from "lucide-vue-next";

const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

// Modal States
const isAddModalOpen = ref(false);
const isChangeModalOpen = ref(false);
const selectedCashFlow = ref<CashFlow | null>(null);

// Filters State
const filterType = ref<CashFlowType | "">("");
const filterSource = ref<CashFlowSource | "">("");
const filterLabel = ref("");
const filterStartDate = ref("");
const filterEndDate = ref("");

function loadData() {
  const params: CashFlowQueryParams = {};
  if (filterType.value) params.type = filterType.value;
  if (filterSource.value) params.source = filterSource.value;
  if (filterLabel.value) params.label = filterLabel.value;
  if (filterStartDate.value) params.start_date = filterStartDate.value;
  if (filterEndDate.value) params.end_date = filterEndDate.value;

  return cashFlowsStore
    .asyncGetCashFlows(params)
    .then(() => cashFlowsStore.asyncGetLabels())
    .catch((error: any) => {
      const errorMsg = error?.message || "Tidak dapat memuat daftar arus kas.";
      showErrorDialog("Gagal Memuat Data", errorMsg);
    });
}

function handleOpenAdd() {
  isAddModalOpen.value = true;
}

function handleOpenEdit(cf: CashFlow) {
  selectedCashFlow.value = cf;
  isChangeModalOpen.value = true;
}

function handleViewDetail(id: string | number) {
  router.push(`/cash-flows/${id}`);
}

async function handleDelete(id: string | number) {
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
  } catch (error: any) {
    showErrorDialog("Gagal Menghapus", error?.message || "Terjadi kesalahan saat menghapus data.");
  }
}

async function handleResetAll() {
  const confirmed = await showConfirmDialog(
    "Reset Semua Data",
    "Tindakan ini akan menghapus seluruh data arus kas Anda secara permanen. Lanjutkan?",
    "Ya, Reset Semua",
    "Batal"
  );
  if (!confirmed) return;

  try {
    await cashFlowsStore.asyncDeleteAllCashFlows();
    showSuccessDialog("Data Direset", "Semua data arus kas berhasil dibersihkan.");
  } catch (error: any) {
    showErrorDialog("Gagal Mereset", error?.message || "Terjadi kesalahan saat mereset data.");
  }
}

function resetFilters() {
  filterType.value = "";
  filterSource.value = "";
  filterLabel.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="space-y-8" data-testid="home-page">
    <!-- Header with Quick Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers class="w-7 h-7 text-sky-400" />
          Ringkasan Arus Kas
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Pantau pemasukan, pengeluaran, dan saldo kas Anda secara real-time
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="handleResetAll"
          :disabled="cashFlowsStore.cashFlows.length === 0"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="btn-reset-all"
        >
          <Trash2 class="w-4 h-4" />
          <span>Reset Semua</span>
        </button>

        <button
          @click="handleOpenAdd"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition"
          data-testid="btn-add-transaction"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" data-testid="metric-cards">
      <!-- Total Saldo Bersih -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Saldo Bersih</span>
          <Wallet class="w-4 h-4 text-sky-400" />
        </div>
        <p class="text-lg font-extrabold" :class="cashFlowsStore.stats.net_balance >= 0 ? 'text-white' : 'text-rose-400'" data-testid="card-net-balance">
          {{ formatRupiah(cashFlowsStore.stats.net_balance) }}
        </p>
      </div>

      <!-- Total Inflow -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-emerald-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inflow</span>
          <TrendingUp class="w-4 h-4" />
        </div>
        <p class="text-lg font-extrabold text-emerald-400" data-testid="card-inflow">
          {{ formatRupiah(cashFlowsStore.stats.total_inflow) }}
        </p>
      </div>

      <!-- Total Outflow -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-rose-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Outflow</span>
          <TrendingDown class="w-4 h-4" />
        </div>
        <p class="text-lg font-extrabold text-rose-400" data-testid="card-outflow">
          {{ formatRupiah(cashFlowsStore.stats.total_outflow) }}
        </p>
      </div>

      <!-- Saldo Tunai -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Saldo Tunai</span>
          <Wallet class="w-4 h-4 text-emerald-400" />
        </div>
        <p class="text-lg font-extrabold text-slate-200" data-testid="card-cash-balance">
          {{ formatRupiah(cashFlowsStore.stats.cash_balance) }}
        </p>
      </div>

      <!-- Saldo Tabungan -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Tabungan</span>
          <Landmark class="w-4 h-4 text-sky-400" />
        </div>
        <p class="text-lg font-extrabold text-slate-200" data-testid="card-savings-balance">
          {{ formatRupiah(cashFlowsStore.stats.savings_balance) }}
        </p>
      </div>

      <!-- Saldo Pinjaman -->
      <div class="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between shadow-sm">
        <div class="flex items-center justify-between text-slate-400 mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider">Pinjaman</span>
          <CreditCard class="w-4 h-4 text-amber-400" />
        </div>
        <p class="text-lg font-extrabold text-slate-200" data-testid="card-loans-balance">
          {{ formatRupiah(cashFlowsStore.stats.loans_balance) }}
        </p>
      </div>
    </div>

    <!-- Interactive Filters Card -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-sm" data-testid="filter-section">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Filter class="w-4 h-4 text-sky-400" />
          <span>Filter & Pencarian</span>
        </div>
        <button
          @click="resetFilters"
          class="px-2 py-1.5 text-xs text-slate-400 hover:text-white transition"
          data-testid="btn-reset-filters"
        >
          Reset Filter
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Type Filter -->
        <div>
          <select
            v-model="filterType"
            @change="loadData"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            data-testid="filter-type"
            aria-label="Filter jenis transaksi"
          >
            <option value="">Semua Jenis (In/Out)</option>
            <option value="inflow">Pemasukan (Inflow)</option>
            <option value="outflow">Pengeluaran (Outflow)</option>
          </select>
        </div>

        <!-- Source Filter -->
        <div>
          <select
            v-model="filterSource"
            @change="loadData"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            data-testid="filter-source"
            aria-label="Filter sumber dana"
          >
            <option value="">Semua Sumber</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label Search -->
        <div>
          <input
            type="text"
            v-model="filterLabel"
            @input="loadData"
            placeholder="Cari label / kategori..."
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            data-testid="filter-label"
            aria-label="Cari label transaksi"
          />
        </div>

        <!-- Start Date -->
        <div>
          <input
            type="date"
            v-model="filterStartDate"
            @change="loadData"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            data-testid="filter-start-date"
            aria-label="Tanggal mulai"
          />
        </div>

        <!-- End Date -->
        <div>
          <input
            type="date"
            v-model="filterEndDate"
            @change="loadData"
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            data-testid="filter-end-date"
            aria-label="Tanggal akhir"
          />
        </div>
      </div>
    </div>

    <!-- Transactions Table / List -->
    <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-sm" data-testid="transactions-card">
      <div class="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
        <h2 class="font-semibold text-white text-base flex items-center gap-2">
          <ArrowUpDown class="w-4 h-4 text-sky-400" />
          Daftar Riwayat Transaksi
        </h2>
        <span class="text-xs text-slate-400">
          {{ cashFlowsStore.cashFlows.length }} data ditemukan
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="cashFlowsStore.isLoadingCashFlows" class="py-16 text-center" data-testid="table-loading">
        <div class="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-slate-400 mt-3">Memuat riwayat transaksi...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="cashFlowsStore.cashFlows.length === 0" class="py-16 text-center" data-testid="table-empty">
        <Calendar class="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 class="text-sm font-semibold text-slate-300">Belum ada transaksi</h3>
        <p class="text-xs text-slate-400 mt-1">Gunakan tombol "Tambah Transaksi" untuk mencatat data baru.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300" data-testid="transactions-table">
          <thead class="bg-slate-900/60 text-xs uppercase text-slate-400 tracking-wider">
            <tr>
              <th class="py-3.5 px-4">Tanggal</th>
              <th class="py-3.5 px-4">Jenis</th>
              <th class="py-3.5 px-4">Label</th>
              <th class="py-3.5 px-4">Sumber</th>
              <th class="py-3.5 px-4 text-right">Nominal</th>
              <th class="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="item in cashFlowsStore.cashFlows"
              :key="item.id"
              class="hover:bg-slate-800/40 transition"
              data-testid="transaction-row"
            >
              <td class="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap" data-testid="row-date">
                {{ formatDate(item.created_at) }}
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="
                    item.type === 'inflow'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  "
                  data-testid="row-badge"
                >
                  {{ item.type === 'inflow' ? '+ Inflow' : '- Outflow' }}
                </span>
              </td>

              <td class="py-3.5 px-4 font-medium text-white whitespace-nowrap" data-testid="row-label">
                {{ item.label }}
              </td>

              <td class="py-3.5 px-4 capitalize text-xs text-slate-400 whitespace-nowrap" data-testid="row-source">
                {{ item.source }}
              </td>

              <td
                class="py-3.5 px-4 text-right font-bold whitespace-nowrap"
                :class="item.type === 'inflow' ? 'text-emerald-400' : 'text-rose-400'"
                data-testid="row-nominal"
              >
                {{ formatRupiah(item.nominal) }}
              </td>

              <!-- Quick Actions -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    @click="handleViewDetail(item.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
                    title="Lihat Detail"
                    aria-label="Lihat Detail"
                    data-testid="btn-action-detail"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    @click="handleOpenEdit(item)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                    title="Ubah Transaksi"
                    aria-label="Ubah Transaksi"
                    data-testid="btn-action-edit"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>

                  <button
                    @click="handleDelete(item.id)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Hapus Transaksi"
                    aria-label="Hapus Transaksi"
                    data-testid="btn-action-delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddModal
      :is-open="isAddModalOpen"
      :on-close="() => (isAddModalOpen = false)"
      :on-success="loadData"
    />

    <ChangeModal
      :is-open="isChangeModalOpen"
      :cash-flow="selectedCashFlow"
      :on-close="() => (isChangeModalOpen = false)"
      :on-success="loadData"
    />
  </div>
</template>
