<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseTextField from '~/components/ui/BaseTextField.vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseToast from '~/components/ui/BaseToast.vue';
import {useAuth} from '~/composables/useAuth';
import type { ToastState } from '~/types/ui';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const toast = ref<ToastState | null>(null);
const fieldErrors = ref<{
  email: string;
  password: string;
}>({
  email: '',
  password: ''
});

const {login} = useAuth();

function toUserErrorMessage(rawMessage: string, fallbackMessage: string) {
  if (!rawMessage.trim()) {
    return fallbackMessage;
  }

  if (rawMessage.includes('Failed to fetch') || rawMessage.includes('<no response>')) {
    return 'Сервер недоступен, попробуйте позже.';
  }

  return rawMessage;
}

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

function showErrorToast(message: string) {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) {
    return;
  }

  toast.value = {
    type: 'error',
    text: normalizedMessage
  };
}

function closeToast() {
  toast.value = null;
}

async function handleSubmit() {
  toast.value = null;

  if (!validateForm() || isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await login(email.value.trim(), password.value);
    await navigateTo('/tasks');
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : '';
    const message = toUserErrorMessage(rawMessage, 'Не удалось выполнить вход. Попробуйте снова.');
    showErrorToast(message);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <BaseToast
      v-if="toast"
      :type="toast.type"
      :text="toast.text"
      @close="closeToast"
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