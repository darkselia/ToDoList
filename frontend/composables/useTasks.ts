import { extractApiErrorMessage } from '~/utils/apiError';
import type { ApiResponse } from '~/types/api';
import type {
  TaskCreatePayload,
  TaskItem,
  TaskPaginationMeta,
  TaskSortBy,
  TaskSortOrder,
  TaskUpdatePayload,
} from '~/types/tasks';

export type TaskOperationResult<T, M = undefined> = {
  success: boolean;
  data: T | null;
  errorMessage: string;
};

export function useTasks() {
  const isLoading = ref(false);
  const nuxtApp = useNuxtApp();

  async function executeRequest<T, M = undefined>(
    request: () => Promise<ApiResponse<T, M>>,
    fallbackMessage: string
  ): Promise<TaskOperationResult<T, M>> {
    try {
      const response = await request();

      if (!response.success || response.data === undefined) {
        return {
          success: false,
          data: null,
          errorMessage: response.error?.message || fallbackMessage,
        };
      }

      return {
        success: true,
        data: response.data,
        errorMessage: '',
      };
    } catch (error) {
      const rawMessage = extractApiErrorMessage(error, '');
      return {
        success: false,
        data: null,
        errorMessage: rawMessage || fallbackMessage,
      };
    }
  }

  async function fetchTasks(
    sortBy: TaskSortBy,
    order: TaskSortOrder,
    page: number,
    limit: number,
    status = 'all'
  ) {
    isLoading.value = true;

    const result = await executeRequest<TaskItem[], TaskPaginationMeta>(
      () => nuxtApp.$api<ApiResponse<TaskItem[], TaskPaginationMeta>>('/api/tasks', {
        method: 'GET',
        query: {
          sortBy,
          order,
          page,
          limit,
          status,
        },
      }),
      'Не удалось получить список задач.'
    );

    isLoading.value = false;
    return result;
  }

  async function createTask(payload: TaskCreatePayload) {
    isLoading.value = true;

    const result = await executeRequest<TaskItem>(
      () => nuxtApp.$api<ApiResponse<TaskItem>>('/api/tasks', {
        method: 'POST',
        body: payload,
      }),
      'Не удалось создать задачу.'
    );

    isLoading.value = false;
    return result;
  }

  async function updateTask(taskId: number, payload: TaskUpdatePayload) {
    isLoading.value = true;

    const result = await executeRequest<TaskItem>(
      () => nuxtApp.$api<ApiResponse<TaskItem>>(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: payload,
      }),
      'Не удалось обновить задачу.'
    );

    isLoading.value = false;
    return result;
  }

  async function deleteTask(taskId: number) {
    isLoading.value = true;

    const result = await executeRequest<{ deleted: boolean; id: number }>(
      () => nuxtApp.$api<ApiResponse<{ deleted: boolean; id: number }>>(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      }),
      'Не удалось удалить задачу.'
    );

    isLoading.value = false;
    return result;
  }

  async function toggleTaskCompletion(task: TaskItem) {
    isLoading.value = true;

    const result = await executeRequest<TaskItem>(
      () => nuxtApp.$api<ApiResponse<TaskItem>>(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: {
          isCompleted: !task.isCompleted,
        },
      }),
      'Не удалось обновить статус задачи.'
    );

    isLoading.value = false;
    return result;
  }

  return {
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
}

