<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import { useAuth } from '~/composables/useAuth';

const { logout } = useAuth();

async function handleLogout() {
  logout();
  await navigateTo('/login');
}
</script>

<template>
  <div class="page-shell">
    <section class="card">
      <h1 class="card-title">Tasks</h1>
      <p class="card-subtitle">
        Страница задач будет добавлена следующим шагом.
      </p>

      <BaseButton variant="secondary" @click="handleLogout">
        Выйти
      </BaseButton>
    </section>
  </div>
</template>
