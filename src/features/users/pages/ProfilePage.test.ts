import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import ProfilePage from "./ProfilePage.vue";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../helpers/toolsHelper")>();
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() };
});

const profile = { id: 1, name: "Delcom", email: "a@b.c", photo: "http://x.test/me.png" };

interface Results {
  photo?: boolean;
  password?: boolean;
}

function setup(results: Results = {}) {
  return renderWithProviders(ProfilePage, {
    beforeMount: (pinia) => {
      const store = useUsersStore(pinia);
      vi.spyOn(store, "asyncGetProfile").mockResolvedValue(true);
      vi.spyOn(store, "asyncChangeProfile").mockResolvedValue(true);
      vi.spyOn(store, "asyncChangePhoto").mockResolvedValue(results.photo ?? true);
      vi.spyOn(store, "asyncChangePassword").mockResolvedValue(results.password ?? true);
    },
  });
}

async function selectPhoto(wrapper: any, file: File) {
  const input = wrapper.find('[data-testid="photo-input"]');
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  await input.trigger("change");
}

async function fillPassword(wrapper: any, current: string, next: string, confirm: string) {
  await wrapper.find('[data-testid="password-current"]').setValue(current);
  await wrapper.find('[data-testid="password-new"]').setValue(next);
  await wrapper.find('[data-testid="password-confirm"]').setValue(confirm);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProfilePage", () => {
  it("should load profile on mount and fill the form when profile arrives", async () => {
    const { wrapper, pinia } = await setup();
    expect(useUsersStore(pinia).asyncGetProfile).toHaveBeenCalledTimes(1);

    useUsersStore(pinia).profile = profile;
    await flushPromises();

    expect((wrapper.find("#profile-name").element as HTMLInputElement).value).toBe("Delcom");
    expect((wrapper.find("#profile-email").element as HTMLInputElement).value).toBe("a@b.c");
  });

  it("should render photo, fallback without photo, and fallback without profile", async () => {
    const { wrapper, pinia } = await setup();
    expect(wrapper.find("img").exists()).toBe(false);

    useUsersStore(pinia).profile = { ...profile, photo: null };
    await flushPromises();
    expect(wrapper.find("img").exists()).toBe(false);

    useUsersStore(pinia).profile = profile;
    await flushPromises();
    expect(wrapper.find("img").attributes("src")).toBe("http://x.test/me.png");
  });

  it("should submit edited profile", async () => {
    const { wrapper, pinia } = await setup();
    useUsersStore(pinia).profile = profile;
    await flushPromises();

    await wrapper.find("#profile-name").setValue("Baru");
    await wrapper.find("#profile-email").setValue("baru@b.c");
    await wrapper.find('[data-testid="profile-form"]').trigger("submit");

    expect(useUsersStore(pinia).asyncChangeProfile).toHaveBeenCalledWith({ name: "Baru", email: "baru@b.c" });
  });

  it("should keep photo button disabled until a file is chosen", async () => {
    const { wrapper } = await setup();
    const button = wrapper.find('[data-testid="photo-form"] button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();

    await selectPhoto(wrapper, new File(["x"], "a.png"));
    expect(button.attributes("disabled")).toBeUndefined();
  });

  it("should upload photo, reset selection and reload profile on success", async () => {
    const { wrapper, pinia } = await setup();
    const file = new File(["x"], "a.png");
    await selectPhoto(wrapper, file);
    await wrapper.find('[data-testid="photo-form"]').trigger("submit");
    await flushPromises();

    const store = useUsersStore(pinia);
    expect(store.asyncChangePhoto).toHaveBeenCalledWith(file);
    expect(store.asyncGetProfile).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="photo-form"] button[type="submit"]').attributes("disabled")).toBeDefined();
  });

  it("should not reload profile when photo upload fails", async () => {
    const { wrapper, pinia } = await setup({ photo: false });
    await selectPhoto(wrapper, new File(["x"], "a.png"));
    await wrapper.find('[data-testid="photo-form"]').trigger("submit");
    await flushPromises();

    expect(useUsersStore(pinia).asyncGetProfile).toHaveBeenCalledTimes(1);
  });

  it("should reject password change when confirmation does not match", async () => {
    const { wrapper, pinia } = await setup();
    await fillPassword(wrapper, "lama", "baru1", "baru2");
    await wrapper.find('[data-testid="password-form"]').trigger("submit");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi baru tidak sesuai.");
    expect(useUsersStore(pinia).asyncChangePassword).not.toHaveBeenCalled();
  });

  it("should change password and reset the fields on success", async () => {
    const { wrapper, pinia } = await setup();
    await fillPassword(wrapper, "lama", "baru1", "baru1");
    await wrapper.find('[data-testid="password-form"]').trigger("submit");
    await flushPromises();

    expect(useUsersStore(pinia).asyncChangePassword).toHaveBeenCalledWith({
      password: "lama",
      new_password: "baru1",
      new_password_confirmation: "baru1",
    });
    expect((wrapper.find('[data-testid="password-current"]').element as HTMLInputElement).value).toBe("");
    expect((wrapper.find('[data-testid="password-new"]').element as HTMLInputElement).value).toBe("");
    expect((wrapper.find('[data-testid="password-confirm"]').element as HTMLInputElement).value).toBe("");
  });

  it("should keep the fields when password change fails", async () => {
    const { wrapper } = await setup({ password: false });
    await fillPassword(wrapper, "lama", "baru1", "baru1");
    await wrapper.find('[data-testid="password-form"]').trigger("submit");
    await flushPromises();

    expect((wrapper.find('[data-testid="password-current"]').element as HTMLInputElement).value).toBe("lama");
  });
});
