<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseToast from '~/components/ui/BaseToast.vue';
import {useAuth} from '~/composables/useAuth';
import type {
  ApiErrorLike,
  TaskItem,
  TaskSortBy,
  TaskSortOrder,
  TaskTableSortField,
  TasksResponse,
  TaskResponse
} from '~/types/tasks';
import type {ToastState, ToastType} from '~/types/ui';

const sortField = ref<TaskTableSortField>('dueDate');
const sortOrder = ref<TaskSortOrder>('desc');

const isLoading = ref(false);
const tasks = ref<TaskItem[]>([]);
const requestError = ref('');
const toast = ref<ToastState | null>(null);
const toastKey = ref(0);

const {logout} = useAuth();
const nuxtApp = useNuxtApp();

const apiSortBy = computed<TaskSortBy>(() => {
  if (sortField.value === 'status') {
    return 'status';
  }

  return 'dueDate';
});

const sortedTasks = computed(() => {
  const tasksCopy = [...tasks.value];

  if (sortField.value === 'title') {
    tasksCopy.sort((leftTask, rightTask) => {
      const compareResult = leftTask.title.localeCompare(rightTask.title, 'ru');
      return sortOrder.value === 'asc' ? compareResult : -compareResult;
    });
    return tasksCopy;
  }

  if (sortField.value === 'dueDate') {
    tasksCopy.sort((leftTask, rightTask) => {
      const leftTime = new Date(leftTask.dueDate).getTime();
      const rightTime = new Date(rightTask.dueDate).getTime();
      return sortOrder.value === 'asc' ? leftTime - rightTime : rightTime - leftTime;
    });
    return tasksCopy;
  }

  tasksCopy.sort((leftTask, rightTask) => {
    const leftStatus = getStatusWeight(leftTask);
    const rightStatus = getStatusWeight(rightTask);
    return sortOrder.value === 'asc' ? leftStatus - rightStatus : rightStatus - leftStatus;
  });

  return tasksCopy;
});

function showToast(type: ToastType, text: string) {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return;
  }

  toastKey.value += 1;
  toast.value = {
    type,
    text: normalizedText
  };
}

function closeToast() {
  toast.value = null;
}

function parseErrorMessage(error: unknown) {
  const fallbackMessage = 'Не удалось получить список задач.';

  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const apiError = error as ApiErrorLike;
  const serverMessage = apiError.response?._data?.error?.message;
  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage.trim();
  }

  if (typeof apiError.message === 'string' && apiError.message.includes('Failed to fetch')) {
    return 'Сервер недоступен, попробуйте позже.';
  }

  return fallbackMessage;
}

function getStatusWeight(task: TaskItem) {
  if (task.isCompleted) {
    return 2;
  }

  const dueTime = new Date(task.dueDate).getTime();
  if (dueTime < Date.now()) {
    return 1;
  }

  return 0;
}

function getStatusLabel(task: TaskItem) {
  if (task.isCompleted) {
    return 'Выполнена';
  }

  if (new Date(task.dueDate).getTime() < Date.now()) {
    return 'Просрочена';
  }

  return 'Активна';
}

function getStatusClass(task: TaskItem) {
  const label = getStatusLabel(task);

  if (label === 'Выполнена') {
    return 'tasks-status--completed';
  }

  if (label === 'Просрочена') {
    return 'tasks-status--overdue';
  }

  return 'tasks-status--active';
}

function updateTaskInList(updatedTask: TaskItem) {
  tasks.value = tasks.value.map((task) => {
    if (task.id !== updatedTask.id) {
      return task;
    }

    return updatedTask;
  });
}

async function toggleTaskCompletion(task: TaskItem) {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await nuxtApp.$api<TaskResponse>(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: {
        isCompleted: !task.isCompleted
      }
    });

    if (!response.success || !response.data) {
      showToast('error', response.error?.message || 'Не удалось обновить статус задачи.');
      return;
    }

    updateTaskInList(response.data);
    showToast('success', 'Статус задачи обновлен.');
  } catch (error) {
    showToast('error', parseErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
}

function formatDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(parsedDate);
}

function getSortArrow(column: TaskTableSortField) {
  if (sortField.value !== column) {
    return '↕';
  }

  return sortOrder.value === 'asc' ? '↑' : '↓';
}

function toggleOrder(nextField: TaskTableSortField) {
  if (sortField.value === nextField) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    return;
  }

  sortField.value = nextField;
  sortOrder.value = 'asc';
}

async function fetchTasks(successMessage: string) {
  requestError.value = '';
  isLoading.value = true;

  try {
    const response = await nuxtApp.$api<TasksResponse>('/api/tasks', {
      method: 'GET',
      query: {
        sortBy: apiSortBy.value,
        order: sortOrder.value,
        status: 'all'
      }
    });

    if (!response.success) {
      tasks.value = [];
      requestError.value = response.error?.message || 'Не удалось получить список задач.';
      showToast('error', requestError.value);
      return;
    }

    tasks.value = Array.isArray(response.data) ? response.data : [];
    showToast('success', successMessage);
  } catch (error) {
    tasks.value = [];
    requestError.value = parseErrorMessage(error);
    showToast('error', requestError.value);
  } finally {
    isLoading.value = false;
  }
}

async function sortByColumn(nextField: TaskTableSortField) {
  toggleOrder(nextField);

  showToast('info', 'Сортировка задач обновлена.');
  return;


}

async function handleLogout() {
  logout();
  await navigateTo('/login');
}

onMounted(async () => {
  await fetchTasks('Список задач загружен.');
});
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
        title="Список задач"
        subtitle="Нажмите на заголовок колонки, чтобы изменить сортировку"
        full-width
        max-width="1000px"
    >
      <div class="tasks-actions">
        <BaseButton variant="secondary" :disabled="isLoading" @click="handleLogout">
          Выйти
        </BaseButton>
      </div>

      <div class="tasks-table-wrap">
        <table class="tasks-table">
          <thead class="tasks-table__head">
          <tr class="tasks-table__row tasks-table__row--head">
            <th class="tasks-table__cell tasks-table__cell--head tasks-table__cell--title">
              <button class="tasks-table__sort-button" type="button" :disabled="isLoading"
                      @click="sortByColumn('title')">
                <span>Название</span>
                <span class="tasks-table__arrow">{{ getSortArrow('title') }}</span>
              </button>
            </th>

            <th class="tasks-table__cell tasks-table__cell--head tasks-table__cell--date">
              <button class="tasks-table__sort-button" type="button" :disabled="isLoading"
                      @click="sortByColumn('dueDate')">
                <span>Дата</span>
                <span class="tasks-table__arrow">{{ getSortArrow('dueDate') }}</span>
              </button>
            </th>

            <th class="tasks-table__cell tasks-table__cell--head tasks-table__cell--status">
              <button class="tasks-table__sort-button" type="button" :disabled="isLoading"
                      @click="sortByColumn('status')">
                <span>Статус</span>
                <span class="tasks-table__arrow">{{ getSortArrow('status') }}</span>
              </button>
            </th>
          </tr>
          </thead>

          <tbody class="tasks-table__body">
          <tr v-if="!isLoading && sortedTasks.length === 0" class="tasks-table__row">
            <td class="tasks-table__cell tasks-table__cell--empty" colspan="3">
              Список задач пуст.
            </td>
          </tr>

          <tr v-for="task in sortedTasks" :key="task.id" class="tasks-table__row">
            <td class="tasks-table__cell tasks-table__cell--title">
              <label class="tasks-table__title-wrap">
                <input
                    class="tasks-table__checkbox"
                    type="checkbox"
                    :checked="task.isCompleted"
                    :disabled="isLoading"
                    @change="toggleTaskCompletion(task)"
                >
                <span>{{ task.title }}</span>
              </label>
            </td>
            <td class="tasks-table__cell tasks-table__cell--date">{{ formatDate(task.dueDate) }}</td>
            <td class="tasks-table__cell tasks-table__cell--status">
              <span :class="['tasks-status', getStatusClass(task)]">{{ getStatusLabel(task) }}</span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.tasks-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.tasks-table-wrap {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
}

.tasks-table__row {
  border-bottom: 1px solid var(--color-border);
}

.tasks-table__cell {
  padding: 12px;
  font-size: 14px;
  text-align: left;
}

.tasks-table__cell--head {
  background: var(--color-surface-muted);
}

.tasks-table__sort-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.tasks-table__sort-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tasks-table__arrow {
  color: var(--color-text-muted);
  font-size: 12px;
}

.tasks-table__cell--empty {
  color: var(--color-text-muted);
}

.tasks-table__cell--status {
  white-space: nowrap;
}

.tasks-table__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tasks-table__checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.tasks-table__checkbox:disabled {
  cursor: not-allowed;
}

.tasks-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-surface);
}

.tasks-status--active {
  background: var(--color-success);
}

.tasks-status--completed {
  background: var(--color-info);
}

.tasks-status--overdue {
  background: var(--color-danger);
}

</style>

