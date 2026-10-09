import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders, createMockPinia } from "~/test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import * as toolsHelper from "~/helpers/toolsHelper";
import type { CashFlow } from "../api/cashFlowApi";

vi.mock("~/helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
  formatRupiah: vi.fn((val) => `Rp ${val}`),
  formatDate: vi.fn((d) => String(d)),
}));

const mockCashFlow: CashFlow = {
  id: "cf-100",
  type: "inflow",
  source: "cash",
  label: "Bonus Project",
  nominal: 750000,
  description: "Bonus dari klien",
  created_at: "2026-03-01",
};

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false or cashFlow is null", () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: false,
        cashFlow: null,
        onClose: vi.fn(),
      },
    });
    expect(wrapper.find("[data-testid='change-modal']").exists()).toBe(false);
  });

  it("populates inputs with cashFlow data when open", () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
    });

    expect(wrapper.find("[data-testid='change-modal']").exists()).toBe(true);
    const labelInput = wrapper.find<HTMLInputElement>("[data-testid='edit-input-label']");
    const nominalInput = wrapper.find<HTMLInputElement>("[data-testid='edit-input-nominal']");
    expect(labelInput.element.value).toBe("Bonus Project");
    expect(nominalInput.element.value).toBe("750000");
  });

  it("handles cashFlow with empty label, nominal 0, and null description", () => {
    const emptyCF: CashFlow = {
      id: "cf-empty",
      type: "outflow",
      source: "cash",
      label: "",
      nominal: 0,
      description: "",
      created_at: "2026-03-01",
    };

    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: emptyCF,
        onClose: vi.fn(),
      },
    });

    const labelInput = wrapper.find<HTMLInputElement>("[data-testid='edit-input-label']");
    const nominalInput = wrapper.find<HTMLInputElement>("[data-testid='edit-input-nominal']");
    expect(labelInput.element.value).toBe("");
    expect(nominalInput.element.value).toBe("");
  });

  it("does nothing in handleSubmit if cashFlow id is falsy", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const updateSpy = vi.spyOn(store, "asyncUpdateCashFlow");

    const cfWithoutId = { ...mockCashFlow, id: "" };
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: cfWithoutId,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("validates empty label and nominal", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
    });

    await wrapper.find("[data-testid='edit-input-label']").setValue("");
    await wrapper.find("form").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Label transaksi wajib diisi.");

    await wrapper.find("[data-testid='edit-input-label']").setValue("Valid Label");
    await wrapper.find("[data-testid='edit-input-nominal']").setValue("0");
    await wrapper.find("form").trigger("submit.prevent");
    expect(errorSpy).toHaveBeenCalledWith("Validasi Gagal", "Nominal transaksi harus lebih dari 0.");
  });

  it("submits updated cash flow successfully", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const updateSpy = vi.spyOn(store, "asyncUpdateCashFlow").mockResolvedValueOnce({
      ...mockCashFlow,
      label: "Updated Label",
      nominal: 800000,
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose,
        onSuccess,
      },
      pinia,
    });

    await wrapper.find("[data-testid='edit-radio-inflow']").trigger("click");
    await wrapper.find("[data-testid='edit-radio-outflow']").trigger("click");
    await wrapper.find("[data-testid='edit-select-source']").setValue("loans");
    await wrapper.find("[data-testid='edit-input-label']").setValue("Updated Label");
    await wrapper.find("[data-testid='edit-input-nominal']").setValue("800000");
    await wrapper.find("[data-testid='edit-input-description']").setValue("Updated Desc");

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(updateSpy).toHaveBeenCalledWith("cf-100", {
      type: "outflow",
      source: "loans",
      label: "Updated Label",
      nominal: 800000,
      description: "Updated Desc",
    });
    expect(successSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submits updated cash flow without onSuccess callback", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncUpdateCashFlow").mockResolvedValueOnce({
      ...mockCashFlow,
      label: "Updated Label",
    });

    const onClose = vi.fn();
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose,
      },
      pinia,
    });

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(onClose).toHaveBeenCalled();
  });

  it("submits updated cash flow with empty description", async () => {
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    const updateSpy = vi.spyOn(store, "asyncUpdateCashFlow").mockResolvedValueOnce(mockCashFlow);

    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("[data-testid='edit-input-description']").setValue("   ");
    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(updateSpy).toHaveBeenCalledWith(
      "cf-100",
      expect.objectContaining({
        description: undefined,
      })
    );
  });

  it("handles update error", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncUpdateCashFlow").mockRejectedValue(new Error("Update failed"));

    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memperbarui", "Update failed");
  });

  it("handles update error without message", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue({} as any);
    const pinia = createMockPinia();
    const store = useCashFlowsStore(pinia);
    vi.spyOn(store, "asyncUpdateCashFlow").mockRejectedValue({});

    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
      pinia,
    });

    await wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith("Gagal Memperbarui", "Terjadi kesalahan saat mengubah transaksi.");
  });

  it("handles cancel button and close button", async () => {
    const onClose = vi.fn();
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose,
      },
    });

    await wrapper.find("[data-testid='btn-close-change-modal']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(1);

    await wrapper.find("[data-testid='btn-cancel-change']").trigger("click");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("displays loading label when isCashFlowChange is true", () => {
    const wrapper = renderWithProviders(ChangeModal, {
      props: {
        isOpen: true,
        cashFlow: mockCashFlow,
        onClose: vi.fn(),
      },
      initialState: {
        cashFlows: {
          isCashFlowChange: true,
        },
      },
    });

    expect(wrapper.find("[data-testid='btn-submit-change']").text()).toContain("Menyimpan...");
  });
});
