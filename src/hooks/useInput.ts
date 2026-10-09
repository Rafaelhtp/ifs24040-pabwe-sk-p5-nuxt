import { ref, type Ref } from "vue";

/**
 * Composable untuk mengelola state input form.
 * Mengembalikan [value, onChange, reset] sehingga dapat dipakai seperti:
 *   const [email, onEmailChange] = useInput("");
 *   <input :value="email" @input="onEmailChange" />
 */
export function useInput(initialValue = ""): [Ref<string>, (event: Event) => void, () => void] {
  const value = ref(initialValue);

  const onChange = (event: Event) => {
    value.value = (event.target as HTMLInputElement).value;
  };

  const reset = () => {
    value.value = initialValue;
  };

  return [value, onChange, reset];
}
