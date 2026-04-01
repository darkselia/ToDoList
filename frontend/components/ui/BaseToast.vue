<script setup lang="ts">
type ToastType = 'success' | 'error' | 'info';

const props = defineProps<{
  type: ToastType;
  text: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isVisible = ref(true);

const toastClass = computed(() => `base-toast--${props.type}`);

const toastIcon = computed(() => {
  if (props.type === 'success') {
    return '✓';
  }

  if (props.type === 'error') {
    return '!';
  }

  return 'i';
});

function closeToast() {
  isVisible.value = false;
  emit('close');
}
</script>

<template>
  <div v-if="isVisible" class="base-toast" :class="toastClass" role="status" aria-live="polite">
    <span class="base-toast__icon" aria-hidden="true">{{ toastIcon }}</span>
    <p class="base-toast__text">{{ text }}</p>
    <button class="base-toast__close" type="button" @click="closeToast">
      x
    </button>
  </div>
</template>

<style scoped>
.base-toast {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 360px;
  width: calc(100vw - 32px);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);

  @media (width<= 768px) {
    right: 8px;
    bottom: 8px;
    width: calc(100vw - 16px);
  }
}

.base-toast--success {
  color: var(--color-success);
  border-color: rgba(22, 101, 52, 0.35);
  background: rgba(22, 101, 52, 0.1);
}

.base-toast--error {
  color: var(--color-danger);
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.1);
}

.base-toast--info {
  color: var(--color-info);
  border-color: rgba(12, 74, 110, 0.35);
  background: rgba(12, 74, 110, 0.1);
}

.base-toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid currentColor;
  flex-shrink: 0;
}

.base-toast__text {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  flex: 1;
}

.base-toast__close {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 16px;
  line-height: 16px;
  cursor: pointer;
  padding: 0;
}
</style>
