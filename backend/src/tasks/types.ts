import type { z } from 'zod';
import type {
    createTaskRequestSchema,
    updateTaskRequestSchema,
    taskQueryRequestSchema,
    taskFiltersSchema,
    taskSortFieldSchema,
    sortOrderSchema,
} from './schemas.js';

type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;
type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>;
type TaskQueryRequest = z.infer<typeof taskQueryRequestSchema>;
type TaskFiltersRequest = z.infer<typeof taskFiltersSchema>;

type TaskSortField = z.infer<typeof taskSortFieldSchema>;
type SortOrder = z.infer<typeof sortOrderSchema>;

type TaskDbRow = {
    id: number;
    title: string;
    description: string;
    due_date: string;
    is_completed: number;
    created_by: number;
    created_at: string;
};

type TaskResponse = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: number;
    createdAt: string;
};

type TaskPaginationMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

type TaskListResult = {
    items: TaskResponse[];
    meta: TaskPaginationMeta;
};

type CreateTaskInput = CreateTaskRequest & { createdBy: number };

function mapTaskDbRowToTask(row: TaskDbRow): TaskResponse {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        isCompleted: row.is_completed === 1,
        createdBy: row.created_by,
        createdAt: row.created_at,
    };
}

export { mapTaskDbRowToTask };

export type {
    CreateTaskRequest,
    UpdateTaskRequest,
    TaskQueryRequest,
    TaskFiltersRequest,
    TaskSortField,
    SortOrder,
    TaskDbRow,
    TaskResponse,
    TaskPaginationMeta,
    TaskListResult,
    CreateTaskInput,
};


