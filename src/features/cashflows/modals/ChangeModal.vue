<script setup lang="ts">
import { ref, watch } from "vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useInput } from "~/hooks/useInput";
import { showSuccessDialog, showErrorDialog } from "~/helpers/toolsHelper";
import { X, Edit3 } from "lucide-vue-next";
import type { CashFlow, CashFlowType, CashFlowSource } from "../api/cashFlowApi";

const props = defineProps<{
  isOpen: boolean;
  cashFlow: CashFlow | null;
  onClose: () => void;
  onSuccess?: () => void;
}>();

const cashFlowsStore = useCashFlowsStore();

const type = ref<CashFlowType>("inflow");
const source = ref<CashFlowSource>("cash");
const labelInput = useInput("");
const nominalInput = useInput("");
const descriptionInput = useInput("");

watch(
  () => props.cashFlow,
  (cf) => {
    if (cf) {
      type.value = cf.type;
      source.value = cf.source;
      labelInput.setValue(cf.label || "");
      nominalInput.setValue(cf.nominal ? String(cf.nominal) : "");
      descriptionInput.setValue(cf.description || "");
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  if (!props.cashFlow?.id) return;

  const nominalValue = Number(nominalInput.value.value);
  if (!labelInput.value.value.trim()) {
    showErrorDialog("Validasi Gagal", "Label transaksi wajib diisi.");
    return;
  }

  if (isNaN(nominalValue) || nominalValue <= 0) {
    showErrorDialog("Validasi Gagal", "Nominal transaksi harus lebih dari 0.");
    return;
  }

  try {
    await cashFlowsStore.asyncUpdateCashFlow(props.cashFlow.id, {
      type: type.value,
      source: source.value,
      label: labelInput.value.value.trim(),
      nominal: nominalValue,
      description: descriptionInput.value.value.trim() || undefined,
    });

    showSuccessDialog("Berhasil", "Transaksi arus kas berhasil diperbarui.");
    props.onClose();
    props.onSuccess?.();
  } catch (error: any) {
    showErrorDialog("Gagal Memperbarui", error?.message || "Terjadi kesalahan saat mengubah transaksi.");
  }
}
</script>

<template>
  <div v-if="isOpen && cashFlow" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm" data-testid="change-modal">
    <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Edit3 class="w-5 h-5 text-amber-400" />
          <h3 class="font-bold text-lg text-white">Ubah Data Arus Kas</h3>
        </div>
        <button
          @click="onClose"
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          data-testid="btn-close-change-modal"
          aria-label="Tutup"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Type Selection -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Jenis Transaksi</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="type = 'inflow'"
              class="py-2.5 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
              :class="type === 'inflow' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'"
              data-testid="edit-radio-inflow"
            >
              <span>Uang Masuk (Inflow)</span>
            </button>
            <button
              type="button"
              @click="type = 'outflow'"
              class="py-2.5 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
              :class="type === 'outflow' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'"
              data-testid="edit-radio-outflow"
            >
              <span>Uang Keluar (Outflow)</span>
            </button>
          </div>
        </div>

        <!-- Source Selection -->
        <div>
          <label for="edit-source" class="block text-sm font-medium text-slate-300 mb-1">Sumber Rekening</label>
          <select
            id="edit-source"
            v-model="source"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            data-testid="edit-select-source"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label / Category -->
        <div>
          <label for="edit-label" class="block text-sm font-medium text-slate-300 mb-1">Label / Kategori</label>
          <input
            id="edit-label"
            type="text"
            :value="labelInput.value.value"
            @input="labelInput.onInput"
            placeholder="Label transaksi"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            data-testid="edit-input-label"
          />
        </div>

        <!-- Nominal -->
        <div>
          <label for="edit-nominal" class="block text-sm font-medium text-slate-300 mb-1">Nominal (Rp)</label>
          <input
            id="edit-nominal"
            type="number"
            min="1"
            :value="nominalInput.value.value"
            @input="nominalInput.onInput"
            placeholder="Nominal"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            data-testid="edit-input-nominal"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="edit-description" class="block text-sm font-medium text-slate-300 mb-1">Deskripsi</label>
          <textarea
            id="edit-description"
            rows="3"
            :value="descriptionInput.value.value"
            @input="descriptionInput.onInput"
            placeholder="Keterangan..."
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            data-testid="edit-input-description"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            data-testid="btn-cancel-change"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="cashFlowsStore.isCashFlowChange"
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            data-testid="btn-submit-change"
          >
            {{ cashFlowsStore.isCashFlowChange ? "Menyimpan..." : "Perbarui Data" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
