export type TaskItem = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  createdBy: number;
  createdAt: string;
};

export type TasksResponse = {
  success: boolean;
  data?: TaskItem[];
  error?: {
    code: number;
    message: string;
  } | null;
};

export type TaskResponse = {
  success: boolean;
  data?: TaskItem;
  error?: {
    code: number;
    message: string;
  } | null;
};

export type TaskSortBy = 'dueDate' | 'createdAt' | 'status';
export type TaskSortOrder = 'asc' | 'desc';

export type TaskTableSortField = 'title' | 'dueDate' | 'status';

export type ApiErrorLike = {
  response?: {
    _data?: {
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
};
