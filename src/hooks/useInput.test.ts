import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("initializes with default empty string", () => {
    const { value } = useInput();
    expect(value.value).toBe("");
  });

  it("initializes with provided value", () => {
    const { value } = useInput("hello world");
    expect(value.value).toBe("hello world");
  });

  it("updates value with setValue", () => {
    const { value, setValue } = useInput("initial");
    setValue("updated");
    expect(value.value).toBe("updated");
  });

  it("updates value via onInput when string is passed", () => {
    const { value, onInput } = useInput();
    onInput("direct string update");
    expect(value.value).toBe("direct string update");
  });

  it("updates value via onInput with input event", () => {
    const { value, onInput } = useInput();
    const event = {
      target: {
        value: "from event",
      },
    } as unknown as Event;

    onInput(event);
    expect(value.value).toBe("from event");
  });

  it("does nothing when null/undefined event target is provided", () => {
    const { value, onInput } = useInput("stay");
    onInput(null as any);
    expect(value.value).toBe("stay");
  });
});
