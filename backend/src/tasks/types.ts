import type {
    CreateTaskBodyInput,
    SortOrderInput,
    TaskFiltersInput,
    TaskSortFieldInput,
    TaskStatusFilterInput,
    UpdateTaskBodyInput,
} from './schemas.js';

type TaskDbRow = {
    id: number;
    title: string;
    description: string;
    due_date: string;
    is_completed: number;
    created_by: number;
    created_at: string;
};

type Task = {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    createdBy: number;
    createdAt: string;
};

type UpdateTaskInput = UpdateTaskBodyInput;
type TaskSortField = TaskSortFieldInput;
type SortOrder = SortOrderInput;
type TaskStatusFilter = TaskStatusFilterInput;
type TaskFilters = TaskFiltersInput;
type CreateTaskInput = CreateTaskBodyInput & { createdBy: number };

function mapTaskDbRowToTask(row: TaskDbRow): Task {
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
    Task,
    TaskDbRow,
    CreateTaskInput,
    UpdateTaskInput,
    TaskSortField,
    SortOrder,
    TaskStatusFilter,
    TaskFilters,
};

