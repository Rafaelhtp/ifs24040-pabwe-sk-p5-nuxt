import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import AddModal from "./AddModal.vue";

function setup(addResult = true) {
  return renderWithProviders(AddModal, {
    beforeMount: (pinia) => {
      const store = useCashFlowsStore(pinia);
      store.labels = ["gaji", "makan"];
      vi.spyOn(store, "asyncAddCashFlow").mockResolvedValue(addResult);
    },
  });
}

describe("AddModal", () => {
  it("should render fields and label suggestions", async () => {
    const { wrapper } = await setup();
    expect(wrapper.text()).toContain("Tambah Transaksi");
    expect(wrapper.findAll("#add-type option")).toHaveLength(2);
    expect(wrapper.findAll("#add-source option")).toHaveLength(3);
    expect(wrapper.findAll("#add-label-options option")).toHaveLength(2);
  });

  it("should require a label", async () => {
    const { wrapper, pinia } = await setup();
    await wrapper.find("#add-nominal").setValue(1000);
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="add-error"]').text()).toContain("Label wajib diisi");
    expect(useCashFlowsStore(pinia).asyncAddCashFlow).not.toHaveBeenCalled();
  });

  it("should require a nominal greater than zero", async () => {
    const { wrapper, pinia } = await setup();
    await wrapper.find("#add-label").setValue("gaji");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find('[data-testid="add-error"]').text()).toContain("Nominal harus lebih dari 0");
    expect(useCashFlowsStore(pinia).asyncAddCashFlow).not.toHaveBeenCalled();
  });

  it("should submit the form and emit saved on success", async () => {
    const { wrapper, pinia } = await setup(true);
    await wrapper.find("#add-type").setValue("outflow");
    await wrapper.find("#add-source").setValue("savings");
    await wrapper.find("#add-label").setValue("  makan  ");
    await wrapper.find("#add-nominal").setValue(25000);
    await wrapper.find("#add-description").setValue("Makan siang");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(useCashFlowsStore(pinia).asyncAddCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "makan",
      nominal: 25000,
      description: "Makan siang",
    });
    expect(wrapper.find('[data-testid="add-error"]').exists()).toBe(false);
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should not emit saved when the request fails", async () => {
    const { wrapper } = await setup(false);
    await wrapper.find("#add-label").setValue("gaji");
    await wrapper.find("#add-nominal").setValue(1000);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from close button, cancel button and backdrop", async () => {
    const { wrapper } = await setup();
    await wrapper.find('[data-testid="add-close"]').trigger("click");
    await wrapper.find('[data-testid="add-cancel"]').trigger("click");
    await wrapper.find('[data-testid="add-modal"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });

  it("should show saving state on the submit button", async () => {
    const { wrapper, pinia } = await setup();
    useCashFlowsStore(pinia).isCashFlowAdd = true;
    await flushPromises();

    const button = wrapper.find('button[type="submit"]');
    expect(button.text()).toBe("Menyimpan...");
    expect(button.attributes("disabled")).toBeDefined();
  });
});
