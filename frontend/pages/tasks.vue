<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseModalShell from '~/components/ui/BaseModalShell.vue';
import BaseTextField from '~/components/ui/BaseTextField.vue';
import TaskForm from '~/components/tasks/TaskForm.vue';
import BaseToast from '~/components/ui/BaseToast.vue';
import {useAuth} from '~/composables/useAuth';
import {useTasks} from '~/composables/useTasks';
import type {
  TaskCreatePayload,
  TaskItem,
  TaskPaginationMeta,
  TaskSortBy,
  TaskSortOrder,
  TaskTableSortField,
  TaskUpdatePayload
} from '~/types/tasks';
import type {ToastState, ToastType} from '~/types/ui';

type TaskModalMode = 'create' | 'edit';

const sortField = ref<TaskTableSortField>('status');
const sortOrder = ref<TaskSortOrder>('asc');
const searchQuery = ref('');
const isSearchLoading = ref(false);

const tasks = ref<TaskItem[]>([]);
const toast = ref<ToastState | null>(null);
const selectedTask = ref<TaskItem | null>(null);
const isTaskModalOpen = ref(false);
const taskModalMode = ref<TaskModalMode>('edit');
const pageSize = ref(5);
const paginationMeta = ref<TaskPaginationMeta>({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
});

const {logout} = useAuth();
const {
  isLoading,
  fetchTasks: fetchTasksRequest,
  createTask: createTaskRequest,
  updateTask: updateTaskRequest,
  deleteTask: deleteTaskRequest,
  toggleTaskCompletion: toggleTaskCompletionRequest,
} = useTasks();

const apiSortBy = computed<TaskSortBy>(() => sortField.value);

function showToast(type: ToastType, text: string) {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return;
  }
  toast.value = {
    type,
    text: normalizedText
  };
}

function closeToast() {
  toast.value = null;
}

function handleSearchInput(value: string) {
  searchQuery.value = value;
}

async function handleSearchSubmit() {
  if (isLoading.value || isSearchLoading.value) {
    return;
  }

  paginationMeta.value = {
    ...paginationMeta.value,
    page: 1,
  };

  isSearchLoading.value = true;
  try {
    await fetchTasks();
  } finally {
    isSearchLoading.value = false;
  }
}

function toUserErrorMessage(rawMessage: string, fallbackMessage: string) {
  if (!rawMessage.trim()) {
    return fallbackMessage;
  }

  if (rawMessage.includes('Date must be in the future.')) {
    return 'Дата дедлайна должна быть в будущем.';
  }

  if (rawMessage.includes('Failed to fetch') || rawMessage.includes('<no response>')) {
    return 'Сервер недоступен, попробуйте позже.';
  }

  return rawMessage;
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

function openTaskModal(task: TaskItem) {
  taskModalMode.value = 'edit';
  selectedTask.value = task;
  isTaskModalOpen.value = true;
}

function openCreateTaskModal() {
  taskModalMode.value = 'create';
  selectedTask.value = null;
  isTaskModalOpen.value = true;
}

function closeTaskModal(force = false) {
  if (isLoading.value && !force) {
    return;
  }

  isTaskModalOpen.value = false;
  selectedTask.value = null;
}

async function toggleTaskCompletion(task: TaskItem) {
  if (isLoading.value) {
    return;
  }

  const result = await toggleTaskCompletionRequest(task);
  if (!result.success || !result.data) {
    showToast('error', toUserErrorMessage(result.errorMessage, 'Не удалось обновить статус задачи.'));
    return;
  }

  await fetchTasks();
  showToast('success', 'Статус задачи обновлен.');
}

async function createTask(payload: TaskCreatePayload) {
  if (isLoading.value) {
    return;
  }

  const result = await createTaskRequest(payload);
  if (!result.success || !result.data) {
    showToast('error', toUserErrorMessage(result.errorMessage, 'Не удалось создать задачу.'));
    return;
  }

  paginationMeta.value = {
    ...paginationMeta.value,
    page: 1,
  };
  await fetchTasks();
  showToast('success', 'Задача создана.');
  closeTaskModal(true);
}

async function updateTask(payload: TaskUpdatePayload) {
  if (isLoading.value || !selectedTask.value) {
    return;
  }

  const result = await updateTaskRequest(selectedTask.value.id, payload);
  if (!result.success || !result.data) {
    showToast('error', toUserErrorMessage(result.errorMessage, 'Не удалось обновить задачу.'));
    return;
  }

  await fetchTasks();
  showToast('success', 'Задача обновлена.');
  closeTaskModal(true);
}

async function deleteSelectedTask() {
  if (isLoading.value || !selectedTask.value) {
    return;
  }

  const result = await deleteTaskRequest(selectedTask.value.id);
  if (!result.success) {
    showToast('error', toUserErrorMessage(result.errorMessage, 'Не удалось удалить задачу.'));
    return;
  }

  await fetchTasks();
  showToast('success', 'Задача удалена.');
  closeTaskModal(true);
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

async function fetchTasks(successMessage = '', pageOverride?: number) {
  const page = pageOverride ?? paginationMeta.value.page;
  const result = await fetchTasksRequest(apiSortBy.value, sortOrder.value, page, pageSize.value, 'all', searchQuery.value);
  if (!result.success || !result.data) {
    tasks.value = [];
    const requestError = toUserErrorMessage(result.errorMessage, 'Не удалось получить список задач.');
    showToast('error', requestError);
    return;
  }

  tasks.value = result.data;
  if (result.meta) {
    paginationMeta.value = result.meta;
  }

  if (successMessage.trim()) {
    showToast('success', successMessage);
  }
}

async function sortByColumn(nextField: TaskTableSortField) {
  if (sortField.value === nextField) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = nextField;
    sortOrder.value = 'asc';
  }

  paginationMeta.value = {
    ...paginationMeta.value,
    page: 1,
  };
  await fetchTasks();
  showToast('info', 'Сортировка задач обновлена.');
}

async function goToPrevPage() {
  if (isLoading.value || !paginationMeta.value.hasPrev) {
    return;
  }

  await fetchTasks('', paginationMeta.value.page - 1);
}

async function goToNextPage() {
  if (isLoading.value || !paginationMeta.value.hasNext) {
    return;
  }

  await fetchTasks('', paginationMeta.value.page + 1);
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
      <div class="tasks-actions tasks-actions--top">
        <form class="tasks-actions__search" @submit.prevent="handleSearchSubmit">
          <BaseTextField
              :model-value="searchQuery"
              name="task-search"
              placeholder="Поиск по названию и описанию"
              :disabled="isLoading || isSearchLoading"
              @update:model-value="handleSearchInput"
          />

          <BaseButton
              class="tasks-search-button"
              type="submit"
              variant="secondary"
              :disabled="isLoading || isSearchLoading"
              :loading="isSearchLoading"
              aria-label="Искать"
          >
            <span v-if="!isSearchLoading" class="tasks-search-button__icon" aria-hidden="true">⌕</span>
          </BaseButton>
        </form>

        <div class="tasks-actions__buttons">
          <BaseButton :disabled="isLoading" @click="openCreateTaskModal">
            Создать задачу
          </BaseButton>
          <BaseButton variant="secondary" :disabled="isLoading" @click="handleLogout">
            Выйти
          </BaseButton>
        </div>
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
          <tr v-if="!isLoading && tasks.length === 0" class="tasks-table__row">
            <td class="tasks-table__cell tasks-table__cell--empty" colspan="3">
              Список задач пуст.
            </td>
          </tr>

          <tr v-for="task in tasks" :key="task.id" class="tasks-table__row tasks-table__row--clickable"
              @click="openTaskModal(task)">
            <td class="tasks-table__cell tasks-table__cell--title">
              <div class="tasks-table__title-wrap">
                <input
                    class="tasks-table__checkbox"
                    type="checkbox"
                    :checked="task.isCompleted"
                    :disabled="isLoading"
                    @click.stop
                    @change="toggleTaskCompletion(task)"
                >
                <span>{{ task.title }}</span>
              </div>
            </td>
            <td class="tasks-table__cell tasks-table__cell--date">{{ formatDate(task.dueDate) }}</td>
            <td class="tasks-table__cell tasks-table__cell--status">
              <span
                  :class="[
                    'tasks-status',
                    {
                      'tasks-status--active': getStatusLabel(task) === 'Активна',
                      'tasks-status--completed': getStatusLabel(task) === 'Выполнена',
                      'tasks-status--overdue': getStatusLabel(task) === 'Просрочена'
                    }
                  ]"
              >
                {{ getStatusLabel(task) }}
              </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="tasks-pagination">
        <BaseButton variant="secondary" :disabled="isLoading || !paginationMeta.hasPrev" @click="goToPrevPage">
          Назад
        </BaseButton>
        <span class="tasks-pagination__text">Страница {{ paginationMeta.page }} из {{ paginationMeta.totalPages }}</span>
        <BaseButton variant="secondary" :disabled="isLoading || !paginationMeta.hasNext" @click="goToNextPage">
          Вперед
        </BaseButton>
      </div>


    </BaseCard>
  </div>

  <BaseModalShell
      :is-open="isTaskModalOpen"
      :loading="isLoading"
      @close="closeTaskModal"
  >
    <TaskForm
        :mode="taskModalMode"
        :task="selectedTask"
        :loading="isLoading"
        @create="createTask"
        @update="updateTask"
        @delete="deleteSelectedTask"
    />
  </BaseModalShell>
</template>

<style scoped>
.tasks-actions {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 0;
  margin-bottom: 16px;
  gap: 8px;
}

.tasks-actions__search {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  margin-right: 10px;
}

.tasks-actions__search :deep(.base-text-field) {
  flex: 1;
  min-width: 0;
}

.tasks-actions__buttons {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tasks-search-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tasks-search-button__icon {
  font-size: 18px;
  line-height: 1;
}

.tasks-pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.tasks-pagination__text {
  color: var(--color-text-muted);
  font-size: 14px;
}

.tasks-table-wrap {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  height: 300px;
  border-collapse: collapse;
}

.tasks-table__row {
  border-bottom: 1px solid var(--color-border);
}

.tasks-table__row--clickable {
  cursor: pointer;
}

.tasks-table__row--clickable:hover {
  background: var(--color-surface-muted);
}

.tasks-table__cell {
  padding: 12px;
  font-size: 14px;
  text-align: left;
  width: fit-content;
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

