import { ref, type Ref } from "vue";

export interface UseInputReturn {
  value: Ref<string>;
  onInput: (event: Event | string) => void;
  setValue: (newValue: string) => void;
}

export function useInput(initialValue = ""): UseInputReturn {
  const value = ref<string>(initialValue);

  const onInput = (event: Event | string) => {
    if (typeof event === "string") {
      value.value = event;
    } else if (event && event.target) {
      value.value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    }
  };

  const setValue = (newValue: string) => {
    value.value = newValue;
  };

  return {
    value,
    onInput,
    setValue,
  };
}
