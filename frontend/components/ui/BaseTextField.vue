<script setup lang="ts">


const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    name?: string;
    placeholder?: string;
    autocomplete?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
  }>(),
  {
    type: 'text',
    name: '',
    placeholder: '',
    autocomplete: 'off',
    disabled: false,
    required: false,
    error: ''
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const inputClasses = computed(() => [
  'base-text-field__control',
  props.error ? 'base-text-field__control--error' : ''
]);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="base-text-field">
    <label class="base-text-field__label">
      {{ label }}
    </label>

    <input
      :value="modelValue"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :required="required"
      :class="inputClasses"
      @input="handleInput"
    >

    <p v-if="error" class="base-text-field__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-text-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.base-text-field__label {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 600;
}

.base-text-field__control {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 16px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.base-text-field__control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
}

.base-text-field__control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-surface-muted);
}

.base-text-field__control--error {
  border-color: var(--color-danger);
}

.base-text-field__error {
  margin: 0;
  font-size: 14px;
  color: var(--color-danger);
}
</style>
