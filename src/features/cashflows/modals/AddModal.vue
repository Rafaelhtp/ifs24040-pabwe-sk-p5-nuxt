<script setup lang="ts">
import { ref } from "vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { useInput } from "~/hooks/useInput";
import { showSuccessDialog, showErrorDialog } from "~/helpers/toolsHelper";
import { X, PlusCircle } from "lucide-vue-next";
import type { CashFlowType, CashFlowSource } from "../api/cashFlowApi";

const props = defineProps<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}>();

const cashFlowsStore = useCashFlowsStore();

const type = ref<CashFlowType>("inflow");
const source = ref<CashFlowSource>("cash");
const labelInput = useInput("");
const nominalInput = useInput("");
const descriptionInput = useInput("");

function resetForm() {
  type.value = "inflow";
  source.value = "cash";
  labelInput.setValue("");
  nominalInput.setValue("");
  descriptionInput.setValue("");
}

async function handleSubmit() {
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
    await cashFlowsStore.asyncAddCashFlow({
      type: type.value,
      source: source.value,
      label: labelInput.value.value.trim(),
      nominal: nominalValue,
      description: descriptionInput.value.value.trim() || undefined,
    });

    showSuccessDialog("Berhasil", "Transaksi arus kas berhasil ditambahkan.");
    resetForm();
    props.onClose();
    props.onSuccess?.();
  } catch (error: any) {
    showErrorDialog("Gagal Menambahkan", error?.message || "Terjadi kesalahan saat menambahkan transaksi.");
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm" data-testid="add-modal">
    <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <PlusCircle class="w-5 h-5 text-sky-400" />
          <h3 class="font-bold text-lg text-white">Tambah Arus Kas Baru</h3>
        </div>
        <button
          @click="onClose"
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          data-testid="btn-close-add-modal"
          aria-label="Tutup"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Type Selection (Inflow / Outflow) -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Jenis Transaksi</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="type = 'inflow'"
              class="py-2.5 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
              :class="type === 'inflow' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'"
              data-testid="radio-inflow"
            >
              <span>Uang Masuk (Inflow)</span>
            </button>
            <button
              type="button"
              @click="type = 'outflow'"
              class="py-2.5 px-4 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
              :class="type === 'outflow' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'"
              data-testid="radio-outflow"
            >
              <span>Uang Keluar (Outflow)</span>
            </button>
          </div>
        </div>

        <!-- Source Selection -->
        <div>
          <label for="add-source" class="block text-sm font-medium text-slate-300 mb-1">Sumber Rekening</label>
          <select
            id="add-source"
            v-model="source"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            data-testid="select-source"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label / Category -->
        <div>
          <label for="add-label" class="block text-sm font-medium text-slate-300 mb-1">Label / Kategori</label>
          <input
            id="add-label"
            type="text"
            :value="labelInput.value.value"
            @input="labelInput.onInput"
            placeholder="Contoh: Gaji, Konsumsi, Transport"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            data-testid="input-label"
          />
        </div>

        <!-- Nominal -->
        <div>
          <label for="add-nominal" class="block text-sm font-medium text-slate-300 mb-1">Nominal (Rp)</label>
          <input
            id="add-nominal"
            type="number"
            min="1"
            :value="nominalInput.value.value"
            @input="nominalInput.onInput"
            placeholder="Contoh: 150000"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            data-testid="input-nominal"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="add-description" class="block text-sm font-medium text-slate-300 mb-1">Deskripsi (Opsional)</label>
          <textarea
            id="add-description"
            rows="3"
            :value="descriptionInput.value.value"
            @input="descriptionInput.onInput"
            placeholder="Keterangan transaksi..."
            class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            data-testid="input-description"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
            data-testid="btn-cancel-add"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="cashFlowsStore.isCashFlowAdd"
            class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
            data-testid="btn-submit-add"
          >
            {{ cashFlowsStore.isCashFlowAdd ? "Menyimpan..." : "Simpan Transaksi" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
