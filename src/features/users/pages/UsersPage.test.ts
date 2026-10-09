import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import UsersPage from "./UsersPage.vue";

function setup(prepare?: (store: ReturnType<typeof useUsersStore>) => void) {
  return renderWithProviders(UsersPage, {
    beforeMount: (pinia) => {
      const store = useUsersStore(pinia);
      vi.spyOn(store, "asyncGetUsers").mockResolvedValue(true);
      prepare?.(store);
    },
  });
}

describe("UsersPage", () => {
  it("should fetch users on mount", async () => {
    const { pinia } = await setup();
    expect(useUsersStore(pinia).asyncGetUsers).toHaveBeenCalledTimes(1);
  });

  it("should show empty state when there are no users", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true);
  });

  it("should show loading state", async () => {
    const { wrapper } = await setup((store) => {
      store.isUsers = true;
    });
    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(false);
  });

  it("should render users with photo or fallback avatar", async () => {
    const { wrapper } = await setup((store) => {
      store.users = [
        { id: 1, name: "Ada", email: "ada@x.id", photo: "http://x.test/ada.png" },
        { id: 2, name: "Budi", email: "budi@x.id", photo: null },
      ];
    });

    const items = wrapper.findAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain("Ada");
    expect(items[0].find("img").attributes("src")).toBe("http://x.test/ada.png");
    expect(items[1].text()).toContain("budi@x.id");
    expect(items[1].find("img").exists()).toBe(false);
  });
});
