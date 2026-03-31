<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseTextField from '~/components/ui/BaseTextField.vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseToast from '~/components/ui/BaseToast.vue';
import {useAuth} from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const requestError = ref('');
const fieldErrors = ref<{
  email: string;
  password: string;
}>({
  email: '',
  password: ''
});

const {login} = useAuth();

function validateEmail(value: string) {
  const normalizedValue = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!normalizedValue) {
    return 'Email обязателен.';
  }

  if (!emailPattern.test(normalizedValue)) {
    return 'Введите корректный email.';
  }

  return '';
}

function validatePassword(value: string) {
  if (!value.trim()) {
    return 'Пароль обязателен.';
  }

  if (value.length < 8) {
    return 'Минимальная длина пароля — 8 символов.';
  }

  return '';
}

function validateForm() {
  const emailError = validateEmail(email.value);
  const passwordError = validatePassword(password.value);

  fieldErrors.value = {
    email: emailError,
    password: passwordError
  };

  return !emailError && !passwordError;
}

async function handleSubmit() {
  requestError.value = '';

  if (!validateForm() || isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await login(email.value.trim(), password.value);
    await navigateTo('/tasks');
  } catch (error) {
    requestError.value = error.message || 'Произошла ошибка при входе. Пожалуйста, попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <BaseToast
      v-if="requestError"
      :text="requestError"
      type="error"
      @close="requestError = ''"
  />
  <div class="page-shell">
    <BaseCard
        title="Вход в To-Do List"
        subtitle="Введите email и пароль, чтобы продолжить."
    >
      <form class="form-stack" @submit.prevent="handleSubmit">
        <BaseTextField
            v-model="email"
            label="Email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            :disabled="isLoading"
            :error="fieldErrors.email"
        />

        <BaseTextField
            v-model="password"
            label="Пароль"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Введите пароль"
            required
            :disabled="isLoading"
            :error="fieldErrors.password"
        />

        <BaseButton
            class="form-stack__button"
            type="submit"
            :loading="isLoading"
        >
          Войти
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-stack__button{
  margin-top: 24px;
}
</style>