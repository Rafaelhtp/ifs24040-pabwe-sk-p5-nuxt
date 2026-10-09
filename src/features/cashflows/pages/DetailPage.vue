<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import {
  SOURCE_LABELS,
  TYPE_LABELS,
  formatDate,
  formatRupiah,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();

const showChange = ref(false);
const cashFlowId = route.params.cashFlowId as string;

async function loadData() {
  const success = await store.asyncGetCashFlow(cashFlowId);
  if (!success) {
    router.replace("/home");
  }
}

onMounted(() => {
  store.cashFlow = null;
  loadData();
});

async function onSaved() {
  showChange.value = false;
  await loadData();
}

async function onDelete() {
  const confirmed = await showConfirmDialog("Hapus transaksi?", "Transaksi akan dihapus permanen.");
  if (!confirmed) {
    return;
  }
  if (await store.asyncDeleteCashFlow(cashFlowId)) {
    router.replace("/home");
  }
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="sr-only">Detail Transaksi</h1>
    <RouterLink to="/home" class="inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
      <ArrowLeft class="h-4 w-4" /> Kembali
    </RouterLink>

    <p v-if="!store.cashFlow" data-testid="detail-loading" class="text-slate-500">Memuat detail transaksi...</p>

    <article v-else data-testid="detail-card" class="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span
            data-testid="detail-badge"
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="store.cashFlow.type === 'inflow' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
            {{ TYPE_LABELS[store.cashFlow.type] }}
          </span>
          <h2 class="mt-3 text-3xl font-extrabold" data-testid="detail-nominal">{{ formatRupiah(store.cashFlow.nominal) }}</h2>
        </div>
        <div class="flex gap-2">
          <button type="button" data-testid="btn-edit" class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white" @click="showChange = true">
            <Pencil class="h-4 w-4" /> Ubah
          </button>
          <button type="button" data-testid="btn-delete" class="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700" @click="onDelete">
            <Trash2 class="h-4 w-4" /> Hapus
          </button>
        </div>
      </header>

      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-bold uppercase text-slate-500">Label</dt>
          <dd data-testid="detail-label">{{ store.cashFlow.label }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase text-slate-500">Sumber Dana</dt>
          <dd data-testid="detail-source">{{ SOURCE_LABELS[store.cashFlow.source] }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-bold uppercase text-slate-500">Keterangan</dt>
          <dd data-testid="detail-description">{{ store.cashFlow.description }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase text-slate-500">Dibuat</dt>
          <dd>{{ formatDate(store.cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-xs font-bold uppercase text-slate-500">Diperbarui</dt>
          <dd>{{ formatDate(store.cashFlow.updated_at) }}</dd>
        </div>
      </dl>
    </article>

    <ChangeModal v-if="showChange && store.cashFlow" :cash-flow="store.cashFlow" @close="showChange = false" @saved="onSaved" />
  </section>
</template>
