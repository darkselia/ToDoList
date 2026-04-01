<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseCalendar from '~/components/ui/BaseCalendar.vue';
import BaseConfirmModal from '~/components/ui/BaseConfirmModal.vue';
import BaseTextField from '~/components/ui/BaseTextField.vue';
import type {TaskCreatePayload, TaskItem, TaskUpdatePayload} from '~/types/tasks';

type TaskFormMode = 'create' | 'edit';

const props = withDefaults(
    defineProps<{
      mode: TaskFormMode;
      task: TaskItem | null;
      loading?: boolean;
    }>(),
    {
      loading: false
    }
);

const emit = defineEmits<{
  create: [payload: TaskCreatePayload];
  update: [payload: TaskUpdatePayload];
  delete: [];
}>();

const isDeleteConfirmOpen = ref(false);
const isCalendarOpen = ref(false);
const calendarWrapRef = ref<HTMLElement | null>(null);
const formData = ref<TaskUpdatePayload>({
  title: '',
  description: '',
  dueDate: '',
  isCompleted: false
});
const errors = ref({
  title: '',
  dueDate: ''
});

const isEditMode = computed(() => props.mode === 'edit');
const submitButtonText = computed(() => (isEditMode.value ? 'Сохранить' : 'Создать'));

const statusLabel = computed(() => {
  if (!isEditMode.value) {
    return '';
  }

  if (formData.value.isCompleted) {
    return 'Выполнена';
  }

  const dueTime = new Date(formData.value.dueDate).getTime();
  if (!Number.isNaN(dueTime) && dueTime < Date.now()) {
    return 'Просрочена';
  }

  return 'Активна';
});

const statusClassMap = computed(() => ({
  'task-form__status--active': statusLabel.value === 'Активна',
  'task-form__status--completed': statusLabel.value === 'Выполнена',
  'task-form__status--overdue': statusLabel.value === 'Просрочена'
}));

function resetErrors() {
  errors.value = {
    title: '',
    dueDate: ''
  };
}

function resetFormForCreate() {
  formData.value = {
    title: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 10),
    isCompleted: false
  };
  resetErrors();
}

function resetFormForEdit() {
  if (!props.task) {
    resetFormForCreate();
    return;
  }

  formData.value = {
    title: props.task.title,
    description: props.task.description || '',
    dueDate: props.task.dueDate.slice(0, 10),
    isCompleted: props.task.isCompleted
  };
  resetErrors();
}

function validateForm() {
  const nextErrors = {
    title: '',
    dueDate: ''
  };

  if (!formData.value.title.trim()) {
    nextErrors.title = 'Название задачи обязательно.';
  }

  const dueDate = new Date(formData.value.dueDate);
  if (!formData.value.dueDate || Number.isNaN(dueDate.getTime())) {
    nextErrors.dueDate = 'Укажите корректную дату.';
  }

  errors.value = nextErrors;
  return !nextErrors.title && !nextErrors.dueDate;
}

function openCalendar() {
  if (props.loading) {
    return;
  }

  isCalendarOpen.value = true;
}

function closeCalendar() {
  isCalendarOpen.value = false;
}

function handleDateSelected() {
  closeCalendar();
}

function handleCalendarClickOutside(event: MouseEvent) {
  if (!calendarWrapRef.value) {
    return;
  }

  const target = event.target as Node | null;
  if (target && !calendarWrapRef.value.contains(target)) {
    closeCalendar();
  }
}

function handleSubmit() {
  if (props.loading || !validateForm()) {
    return;
  }

  const payload: TaskUpdatePayload = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    dueDate: formData.value.dueDate,
    isCompleted: formData.value.isCompleted
  };

  if (isEditMode.value) {
    emit('update', payload);
    return;
  }

  emit('create', payload);
}

function openDeleteConfirm() {
  if (props.loading || !isEditMode.value) {
    return;
  }

  isDeleteConfirmOpen.value = true;
}

function closeDeleteConfirm() {
  if (props.loading) {
    return;
  }

  isDeleteConfirmOpen.value = false;
}

function handleDeleteConfirm() {
  emit('delete');
}

watch(
    () => [props.mode, props.task] as const,
    () => {
      if (props.mode === 'create') {
        resetFormForCreate();
      } else {
        resetFormForEdit();
      }

      closeCalendar();
      closeDeleteConfirm();
    },
    {immediate: true}
);

watch(isCalendarOpen, (isOpen) => {
  if (!import.meta.client) {
    return;
  }

  if (isOpen) {
    document.addEventListener('mousedown', handleCalendarClickOutside);
    return;
  }

  document.removeEventListener('mousedown', handleCalendarClickOutside);
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('mousedown', handleCalendarClickOutside);
  }
});
</script>

<template>
  <div class="task-form">
    <div class="task-form__header">
      <h3 class="task-form__title">{{ isEditMode ? 'Детали задачи' : 'Создание задачи' }}</h3>
      <span
          v-if="isEditMode"
          :class="['task-form__status', statusClassMap]"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="task-form__fields">
      <BaseTextField
          v-model="formData.title"
          label="Название"
          name="title"
          placeholder="Введите название задачи"
          :disabled="loading"
          :error="errors.title"
      />

      <BaseTextField
          v-model="formData.description"
          label="Описание"
          name="description"
          placeholder="Введите описание"
          :disabled="loading"
      />

      <div ref="calendarWrapRef" class="task-form__calendar-wrap">
        <div class="task-form__date-input" @click="openCalendar">
          <BaseTextField
              v-model="formData.dueDate"
              label="Дата"
              name="dueDate"
              placeholder="YYYY-MM-DD"
              :disabled="loading"
              :error="errors.dueDate"
          />
        </div>

        <div v-if="isCalendarOpen" class="task-form__calendar-popover">
          <BaseCalendar
              v-model="formData.dueDate"
              locale="ru"
              @date-selected="handleDateSelected"
          />
        </div>
      </div>

      <label class="task-form__checkbox-wrap">
        <input
            class="task-form__checkbox"
            type="checkbox"
            :checked="formData.isCompleted"
            :disabled="loading"
            @change="formData.isCompleted = !formData.isCompleted"
        >
        <span>Выполнить задачу</span>
      </label>
    </div>

    <div class="task-form__actions">
      <div class="task-form__actions-left">
        <BaseButton
            v-if="isEditMode"
            variant="danger"
            :disabled="loading"
            @click="openDeleteConfirm"
        >
          Удалить
        </BaseButton>
      </div>

      <div class="task-form__actions-right">
        <BaseButton :loading="loading" @click="handleSubmit">
          {{ submitButtonText }}
        </BaseButton>
      </div>
    </div>

    <BaseConfirmModal
        v-if="isDeleteConfirmOpen"
        title="Удалить задачу"
        message="Вы уверены, что хотите удалить задачу? Это действие нельзя отменить."
        confirm-text="Удалить"
        cancel-text="Отмена"
        :loading="loading"
        @cancel="closeDeleteConfirm"
        @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
}

.task-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.task-form__title {
  margin: 0;
  font-size: 22px;
}

.task-form__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-surface);
}

.task-form__status--active {
  background: var(--color-success);
}

.task-form__status--completed {
  background: var(--color-info);
}

.task-form__status--overdue {
  background: var(--color-danger);
}

.task-form__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-form__calendar-wrap {
  position: relative;
}

.task-form__calendar-popover {
  position: absolute;
  bottom: 4px;
  right: 8px;
  z-index: 10000;
}

.task-form__checkbox-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.task-form__checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--color-primary);
}

.task-form__actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-form__actions-right {
  display: inline-flex;
  gap: 12px;
}
</style>

