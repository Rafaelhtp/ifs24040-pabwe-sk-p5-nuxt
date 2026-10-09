<script setup lang="ts">
import { reactive, ref } from "vue";
import { X } from "lucide-vue-next";
import { SOURCE_LABELS, TYPE_LABELS } from "../../../helpers/toolsHelper";
import type { CashFlowSource, CashFlowType } from "../api/cashFlowApi";
import { useCashFlowsStore } from "../states/cashFlowsStore";

const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useCashFlowsStore();

const form = reactive({
  type: "inflow" as CashFlowType,
  source: "cash" as CashFlowSource,
  label: "",
  nominal: "" as number | "",
  description: "",
});
const error = ref("");

async function onSubmit() {
  const nominal = Number(form.nominal);
  if (!form.label.trim()) {
    error.value = "Label wajib diisi.";
    return;
  }
  if (!(nominal > 0)) {
    error.value = "Nominal harus lebih dari 0.";
    return;
  }
  error.value = "";

  const success = await store.asyncAddCashFlow({
    type: form.type,
    source: form.source,
    label: form.label.trim(),
    nominal,
    description: form.description,
  });
  if (success) {
    emit("saved");
  }
}
</script>

<template>
  <div
    data-testid="add-modal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="emit('close')">
    <form class="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Tambah Transaksi</h2>
        <button type="button" data-testid="add-close" aria-label="Tutup" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="add-type" class="mb-1 block text-xs font-bold uppercase text-slate-500">Jenis</label>
          <select id="add-type" v-model="form.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option v-for="(text, value) in TYPE_LABELS" :key="value" :value="value">{{ text }}</option>
          </select>
        </div>
        <div>
          <label for="add-source" class="mb-1 block text-xs font-bold uppercase text-slate-500">Sumber Dana</label>
          <select id="add-source" v-model="form.source" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option v-for="(text, value) in SOURCE_LABELS" :key="value" :value="value">{{ text }}</option>
          </select>
        </div>
      </div>

      <div>
        <label for="add-label" class="mb-1 block text-xs font-bold uppercase text-slate-500">Label</label>
        <input
          id="add-label"
          v-model="form.label"
          type="text"
          list="add-label-options"
          placeholder="mis. gaji, makan, transport"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <datalist id="add-label-options">
          <option v-for="label in store.labels" :key="label" :value="label" />
        </datalist>
      </div>

      <div>
        <label for="add-nominal" class="mb-1 block text-xs font-bold uppercase text-slate-500">Nominal (Rp)</label>
        <input
          id="add-nominal"
          v-model.number="form.nominal"
          type="number"
          min="1"
          placeholder="0"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>

      <div>
        <label for="add-description" class="mb-1 block text-xs font-bold uppercase text-slate-500">Keterangan</label>
        <textarea
          id="add-description"
          v-model="form.description"
          rows="3"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>

      <p v-if="error" data-testid="add-error" class="text-sm text-rose-700">{{ error }}</p>

      <div class="flex justify-end gap-3">
        <button type="button" data-testid="add-cancel" class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="store.isCashFlowAdd"
          class="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {{ store.isCashFlowAdd ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </form>
  </div>
</template>
