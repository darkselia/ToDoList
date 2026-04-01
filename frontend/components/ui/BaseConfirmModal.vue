<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';

withDefaults(
  defineProps<{
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
  }>(),
  {
    title: 'Подтверждение',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    loading: false,
  }
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  emit('confirm');
}
</script>

<template>
  <div class="confirm-modal" role="dialog" aria-modal="true" @click.self="handleCancel">
    <div class="confirm-modal__content">
      <h3 class="confirm-modal__title">{{ title }}</h3>
      <p class="confirm-modal__message">{{ message }}</p>

      <div class="confirm-modal__actions">
        <BaseButton variant="secondary" :disabled="loading" @click="handleCancel">
          {{ cancelText }}
        </BaseButton>
        <BaseButton variant="danger" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 16px;
}

.confirm-modal__content {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.confirm-modal__title {
  margin: 0 0 8px;
  color: var(--color-text);
  font-size: 20px;
}

.confirm-modal__message {
  margin: 0 0 16px;
  color: var(--color-text-muted);
  font-size: 14px;
}

.confirm-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

