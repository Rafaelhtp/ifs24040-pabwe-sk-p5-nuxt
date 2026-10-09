import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("should update value on change event", () => {
    const [value, onChange] = useInput("awal");
    expect(value.value).toBe("awal");

    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(value.value).toBe("baru");
  });

  it("should reset to initial value and default to empty string", () => {
    const [value, onChange, reset] = useInput();
    onChange({ target: { value: "x" } } as unknown as Event);
    reset();
    expect(value.value).toBe("");
  });
});
