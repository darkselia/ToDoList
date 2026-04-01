<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      title?: string;
      subtitle?: string;
      maxWidth?: string;
      minWidth?: string;
      fullWidth?: boolean;
    }>(),
    {
      subtitle: '',
      maxWidth: '',
      minWidth: '',
      fullWidth: false,
    }
);

const cardStyle = computed(() => ({
  width: props.fullWidth ? '100%' : 'auto',
  maxWidth: props.maxWidth || undefined,
  minWidth: props.minWidth || undefined
}));
</script>

<template>
  <section class="card" :style="cardStyle">
    <h1 v-if="title" class="card-title">{{ title }}</h1>
    <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
    <slot/>
  </section>
</template>

<style scoped>

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 32px;
}

.card-title {
  font-size: 24px;
  margin: 0 0 8px;
}

.card-subtitle {
  margin: 0 0 24px;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>

