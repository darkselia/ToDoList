export type TaskItem = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: number;
    createdAt: string;
};

export type TaskUpdatePayload = {
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
};

export type TaskCreatePayload = {
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
};

export type TaskPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TaskSortBy = 'title' | 'dueDate' | 'createdAt' | 'status';
export type TaskSortOrder = 'asc' | 'desc';

export type TaskTableSortField = 'title' | 'dueDate' | 'status';
