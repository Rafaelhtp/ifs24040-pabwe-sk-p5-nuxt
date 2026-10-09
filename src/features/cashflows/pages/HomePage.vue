<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { Eye, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-vue-next";
import {
  SOURCE_LABELS,
  TYPE_LABELS,
  formatDate,
  formatRupiah,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import type { CashFlow, CashFlowQueryParams } from "../api/cashFlowApi";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";

const store = useCashFlowsStore();

const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const filters = reactive({ type: "", source: "", label: "", start_date: "", end_date: "" });

const summaryCards = computed(() => [
  { key: "cashflow", title: "Total Saldo Kas Bersih", value: store.stats.cashflow },
  { key: "inflow", title: "Total Pemasukan", value: store.stats.total_inflow },
  { key: "outflow", title: "Total Pengeluaran", value: store.stats.total_outflow },
  { key: "cash", title: "Saldo Kas Tunai", value: store.stats.cash },
  { key: "savings", title: "Saldo Tabungan", value: store.stats.savings },
  { key: "loans", title: "Saldo Pinjaman", value: store.stats.loans },
]);

function buildParams(): CashFlowQueryParams {
  return {
    type: filters.type,
    source: filters.source,
    label: filters.label,
    start_date: filters.start_date ? `${filters.start_date} 00:00:00` : "",
    end_date: filters.end_date ? `${filters.end_date} 23:59:59` : "",
  } as CashFlowQueryParams;
}

async function loadData() {
  await store.asyncGetCashFlows(buildParams());
}

onMounted(async () => {
  await Promise.all([loadData(), store.asyncGetLabels()]);
});

async function onResetFilters() {
  Object.assign(filters, { type: "", source: "", label: "", start_date: "", end_date: "" });
  await loadData();
}

async function onSaved() {
  showAdd.value = false;
  editing.value = null;
  await Promise.all([loadData(), store.asyncGetLabels()]);
}

async function onDelete(item: CashFlow) {
  const confirmed = await showConfirmDialog("Hapus transaksi?", `Transaksi "${item.label}" akan dihapus permanen.`);
  if (!confirmed) {
    return;
  }
  if (await store.asyncDeleteCashFlow(item.id)) {
    await loadData();
  }
}

async function onDeleteAll() {
  const confirmed = await showConfirmDialog("Reset semua transaksi?", "Seluruh catatan arus kas akan dihapus permanen.");
  if (!confirmed) {
    return;
  }
  if (await store.asyncDeleteAllCashFlows()) {
    await loadData();
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500">Semua catatan keuanganmu dalam satu tempat.</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          data-testid="btn-add"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white"
          @click="showAdd = true">
          <Plus class="h-4 w-4" /> Tambah Transaksi
        </button>
        <button
          type="button"
          data-testid="btn-delete-all"
          :disabled="store.isCashFlowDeleteAll"
          class="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700"
          @click="onDeleteAll">
          <RotateCcw class="h-4 w-4" /> Reset Semua
        </button>
      </div>
    </header>

    <!-- Kartu metrik -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="summary-cards">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        :data-testid="`card-${card.key}`"
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ card.title }}</p>
        <p class="mt-2 text-2xl font-extrabold">{{ formatRupiah(card.value) }}</p>
      </div>
    </div>

    <!-- Filter -->
    <form
      data-testid="filter-form"
      class="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2 lg:grid-cols-6"
      @submit.prevent="loadData">
      <select v-model="filters.type" aria-label="Filter jenis transaksi" data-testid="filter-type" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <option value="">Semua jenis</option>
        <option v-for="(text, value) in TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
      </select>
      <select v-model="filters.source" aria-label="Filter sumber dana" data-testid="filter-source" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <option value="">Semua sumber</option>
        <option v-for="(text, value) in SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
      </select>
      <select v-model="filters.label" aria-label="Filter label" data-testid="filter-label" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <option value="">Semua label</option>
        <option v-for="label in store.labels" :key="label" :value="label">{{ label }}</option>
      </select>
      <input v-model="filters.start_date" type="date" aria-label="Tanggal mulai" data-testid="filter-start" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      <input v-model="filters.end_date" type="date" aria-label="Tanggal akhir" data-testid="filter-end" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      <div class="flex gap-2">
        <button type="submit" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">
          <Search class="h-4 w-4" /> Terapkan
        </button>
        <button type="button" data-testid="filter-reset" class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold" @click="onResetFilters">
          Reset
        </button>
      </div>
    </form>

    <!-- Daftar transaksi -->
    <p v-if="store.isCashFlow" data-testid="cashflow-loading" class="text-slate-500">Memuat transaksi...</p>
    <p v-else-if="store.cashFlows.length === 0" data-testid="cashflow-empty" class="rounded-2xl bg-white p-8 text-center text-slate-500">
      Belum ada transaksi.
    </p>

    <ul v-else class="space-y-3" data-testid="cashflow-list">
      <li
        v-for="item in store.cashFlows"
        :key="item.id"
        data-testid="cashflow-item"
        class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              data-testid="badge"
              class="rounded-full px-2.5 py-0.5 text-xs font-bold"
              :class="item.type === 'inflow' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
              {{ TYPE_LABELS[item.type] }}
            </span>
            <span class="text-xs text-slate-500">{{ SOURCE_LABELS[item.source] }} · {{ item.label }}</span>
          </div>
          <p class="mt-1 truncate text-sm text-slate-600">{{ item.description }}</p>
          <p class="text-xs text-slate-500">{{ formatDate(item.created_at) }}</p>
        </div>

        <div class="flex items-center gap-3">
          <p class="font-extrabold" :class="item.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'">
            {{ item.type === "inflow" ? "+" : "-" }}{{ formatRupiah(item.nominal) }}
          </p>
          <RouterLink :to="`/cash-flows/${item.id}`" data-testid="btn-detail" aria-label="Lihat detail" class="rounded-lg bg-slate-100 p-2">
            <Eye class="h-4 w-4" />
          </RouterLink>
          <button type="button" data-testid="btn-edit" aria-label="Ubah" class="rounded-lg bg-slate-100 p-2" @click="editing = item">
            <Pencil class="h-4 w-4" />
          </button>
          <button type="button" data-testid="btn-delete" aria-label="Hapus" class="rounded-lg bg-rose-50 p-2 text-rose-700" @click="onDelete(item)">
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="onSaved" />
    <ChangeModal v-if="editing" :cash-flow="editing" @close="editing = null" @saved="onSaved" />
  </section>
</template>
