import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import type { CashFlow } from "../api/cashFlowApi";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import ChangeModal from "./ChangeModal.vue";

const cashFlow: CashFlow = {
  id: 7,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 2500000,
  created_at: "2024-10-05T11:26:45.000000Z",
  updated_at: "2024-10-05T11:26:48.000000Z",
};

function setup(changeResult = true) {
  return renderWithProviders(ChangeModal, {
    props: { cashFlow },
    beforeMount: (pinia) => {
      const store = useCashFlowsStore(pinia);
      store.labels = ["gaji"];
      vi.spyOn(store, "asyncChangeCashFlow").mockResolvedValue(changeResult);
    },
  });
}

describe("ChangeModal", () => {
  it("should prefill the form from the cash flow", async () => {
    const { wrapper } = await setup();
    expect(wrapper.text()).toContain("Ubah Transaksi");
    expect((wrapper.find("#change-type").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.find("#change-source").element as HTMLSelectElement).value).toBe("cash");
    expect((wrapper.find("#change-label").element as HTMLInputElement).value).toBe("gaji");
    expect((wrapper.find("#change-nominal").element as HTMLInputElement).value).toBe("2500000");
    expect((wrapper.find("#change-description").element as HTMLTextAreaElement).value).toBe("Gaji bulanan");
    expect(wrapper.findAll("#change-label-options option")).toHaveLength(1);
  });

  it("should require a label", async () => {
    const { wrapper, pinia } = await setup();
    await wrapper.find("#change-label").setValue("   ");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="change-error"]').text()).toContain("Label wajib diisi");
    expect(useCashFlowsStore(pinia).asyncChangeCashFlow).not.toHaveBeenCalled();
  });

  it("should require a nominal greater than zero", async () => {
    const { wrapper, pinia } = await setup();
    await wrapper.find("#change-nominal").setValue(0);
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="change-error"]').text()).toContain("Nominal harus lebih dari 0");
    expect(useCashFlowsStore(pinia).asyncChangeCashFlow).not.toHaveBeenCalled();
  });

  it("should submit changes and emit saved on success", async () => {
    const { wrapper, pinia } = await setup(true);
    await wrapper.find("#change-type").setValue("outflow");
    await wrapper.find("#change-source").setValue("loans");
    await wrapper.find("#change-label").setValue("cicilan");
    await wrapper.find("#change-nominal").setValue(500000);
    await wrapper.find("#change-description").setValue("Cicilan");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncChangeCashFlow).toHaveBeenCalledWith(7, {
      type: "outflow",
      source: "loans",
      label: "cicilan",
      nominal: 500000,
      description: "Cicilan",
    });
    expect(wrapper.find('[data-testid="change-error"]').exists()).toBe(false);
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should not emit saved when the request fails", async () => {
    const { wrapper } = await setup(false);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from close button, cancel button and backdrop", async () => {
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="change-close"]').trigger("click");
    await wrapper.find('[data-testid="change-cancel"]').trigger("click");
    await wrapper.find('[data-testid="change-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });

  it("should show saving state on the submit button", async () => {
    const { wrapper, pinia } = await setup();
    useCashFlowsStore(pinia).isCashFlowChange = true;
    await flushPromises();

    const button = wrapper.find('button[type="submit"]');
    expect(button.text()).toBe("Menyimpan...");
    expect(button.attributes("disabled")).toBeDefined();
  });
});
