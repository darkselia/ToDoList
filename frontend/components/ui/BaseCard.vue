<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
  }>(),
  {
    subtitle: ''
  }
);
</script>

<template>
  <section class="card">
    <h1 class="card-title">{{ title }}</h1>
    <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
    <slot />
  </section>
</template>

<style scoped>

.card {
  width: 100%;
  max-width: 420px;
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

