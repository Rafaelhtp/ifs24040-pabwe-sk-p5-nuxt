import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import * as toolsHelper from "~/helpers/toolsHelper";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: false,
        onClose: vi.fn(),
      },
    });
    expect(wrapper.find("[data-testid='add-modal']").exists()).toBe(false);
  });

  it("renders form elements when isOpen is true", () => {
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
    });

    expect(wrapper.find("[data-testid='add-modal']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-label']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='input-nominal']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='select-source']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='radio-inflow']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='radio-outflow']").exists()).toBe(true);
  });

  it("validates empty label", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Label transaksi wajib diisi.");
  });

  it("validates invalid nominal", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
    });

    await wrapper.find("[data-testid='input-label']").setValue("Belanja");
    await wrapper.find("[data-testid='input-nominal']").setValue("0");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Nominal transaksi harus lebih dari 0.");
  });

  it("submits valid transaction, calls store, and triggers close and success callbacks", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const addSpy = vi.spyOn(store, "asyncAddCashFlow").mockResolvedValueOnce({
      id: "cf-1",
      type: "outflow",
      source: "savings",
      label: "Makan Siang",
      nominal: 45000,
      description: "Resto",
      created_at: "2026-03-01",
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose,
        onSuccess,
      },
      pinia,
    });

    await wrapper.find("[data-testid='radio-inflow']").trigger("click");
    await wrapper.find("[data-testid='radio-outflow']").trigger("click");
    await wrapper.find("[data-testid='select-source']").setValue("savings");
    await wrapper.find("[data-testid='input-label']").setValue("Makan Siang");
    await wrapper.find("[data-testid='input-nominal']").setValue("45000");
    await wrapper.find("[data-testid='input-description']").setValue("Resto");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(addSpy).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "Makan Siang",
      nominal: 45000,
      description: "Resto",
    });
    expect(successSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submits without onSuccess prop", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncAddCashFlow").mockResolvedValueOnce({} as any);

    const onClose = vi.fn();
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose,
      },
      pinia,
    });

    await wrapper.find("[data-testid='input-label']").setValue("Belanja");
    await wrapper.find("[data-testid='input-nominal']").setValue("150000");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(onClose).toHaveBeenCalled();
  });

  it("handles submission error", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncAddCashFlow").mockRejectedValue(new Error("API failure"));

    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("[data-testid='input-label']").setValue("Gaji");
    await wrapper.find("[data-testid='input-nominal']").setValue("5000000");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menambahkan", "API failure");
  });

  it("handles submission error without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncAddCashFlow").mockRejectedValue({});

    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("[data-testid='input-label']").setValue("Gaji");
    await wrapper.find("[data-testid='input-nominal']").setValue("5000000");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Menambahkan", "Terjadi kesalahan saat menambahkan transaksi.");
  });

  it("triggers close via close button and cancel button", async () => {
    const onClose = vi.fn();
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose,
      },
    });

    await wrapper.find("[data-testid='btn-close-add-modal']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(1);

    await wrapper.find("[data-testid='btn-cancel-add']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("displays loading label when isCashFlowAdd is true", () => {
    const wrapper = renderWithProviders(AddModal, {
      props: {
        isOpen: true,
        onClose: vi.fn(),
      },
      initialState: {
        cashFlows: {
          isCashFlowAdd: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='btn-submit-add']").text()).toContain("Menyimpan...");
  });
});
