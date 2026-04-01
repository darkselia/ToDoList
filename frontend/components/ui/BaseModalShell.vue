<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    loading?: boolean;
    backText?: string;
  }>(),
  {
    loading: false,
    backText: 'Назад'
  }
);

const emit = defineEmits<{
  close: [];
}>();

const previousBodyOverflow = ref('');

function lockBodyScroll() {
  if (!import.meta.client) {
    return;
  }

  previousBodyOverflow.value = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (!import.meta.client) {
    return;
  }

  document.body.style.overflow = previousBodyOverflow.value;
}

function handleClose() {
  if (props.loading) {
    return;
  }

  emit('close');
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll();
      return;
    }

    unlockBodyScroll();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  unlockBodyScroll();
});
</script>

<template>
  <div v-if="isOpen" class="base-modal-shell" role="dialog" aria-modal="true" @click.self="handleClose">
    <div class="base-modal-shell__content">
      <button class="base-modal-shell__back" type="button" :disabled="loading" @click="handleClose">
        <span aria-hidden="true">&larr;</span>
        <span>{{ backText }}</span>
      </button>

      <slot />
    </div>
  </div>
</template>

<style scoped>
.base-modal-shell {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.base-modal-shell__content {
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.base-modal-shell__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

.base-modal-shell__back:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

