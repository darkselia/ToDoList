import {all, get, getDatabase, run} from '../db/sqlite.js';
import {mapTaskDbRowToTask} from './types.js';
import type {
    CreateTaskInput,
    Task,
    TaskDbRow,
    TaskFilters,
    TaskSortField,
    SortOrder,
    UpdateTaskInput,
} from './types.js';

function resolveSortColumn(sortBy: TaskSortField = 'createdAt') {
    switch (sortBy) {
        case 'dueDate':
            return 'due_date';
        case 'status':
            return 'is_completed';
        case 'createdAt':
        default:
            return 'created_at';
    }
}

function resolveSortOrder(order: SortOrder = 'desc') {
    return order === 'asc' ? 'ASC' : 'DESC';
}

async function createTask(input: CreateTaskInput): Promise<Task> {
    const db = getDatabase();

    const result = await run(
        db,
        `
            INSERT INTO tasks (title, description, due_date, is_completed, created_by)
            VALUES (?, ?, ?, ?, ?)
        `,
        [
            input.title.trim(),
            input.description.trim(),
            input.dueDate.toISOString(),
            input.isCompleted ? 1 : 0,
            input.createdBy,
        ],
    );

    const createdTask = await getTaskById(result.lastID);
    if (!createdTask) {
        throw new Error('Failed to create task.');
    }

    return createdTask;
}

async function getTaskById(id: number): Promise<Task | null> {
    const db = getDatabase();

    const row = await get<TaskDbRow>(
        db,
        `
            SELECT id, title, description, due_date, is_completed, created_by, created_at
            FROM tasks
            WHERE id = ?
        `,
        [id],
    );

    return row ? mapTaskDbRowToTask(row) : null;
}

async function getAllTasks(filters: TaskFilters): Promise<Task[]> {
    const db = getDatabase();
    const sortColumn = resolveSortColumn(filters.sortBy);
    const sortOrder = resolveSortOrder(filters.order);

    const whereClauses: string[] = ['created_by = ?'];
    const params: unknown[] = [filters.userId];

    if (filters.status === 'active') {
        whereClauses.push('is_completed = 0');
    }

    if (filters.status === 'completed') {
        whereClauses.push('is_completed = 1');
    }

    if (filters.status === 'overdue') {
        whereClauses.push('is_completed = 0');
        whereClauses.push("date(due_date) < date('now')");
    }

    if (filters.dueDateFrom) {
        whereClauses.push('date(due_date) >= date(?)');
        params.push(filters.dueDateFrom.toISOString());
    }

    if (filters.dueDateTo) {
        whereClauses.push('date(due_date) <= date(?)');
        params.push(filters.dueDateTo.toISOString());
    }

    if (filters.search && filters.search.trim().length > 0) {
        const searchPattern = `%${filters.search.trim().toLowerCase()}%`;
        whereClauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)');
        params.push(searchPattern, searchPattern);
    }

    const rows = await all<TaskDbRow>(
        db,
        `
            SELECT id, title, description, due_date, is_completed, created_by, created_at
            FROM tasks
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY ${sortColumn} ${sortOrder}
        `,
        params,
    );

    return rows.map(mapTaskDbRowToTask);
}

async function updateTask(id: number, input: UpdateTaskInput): Promise<Task | null> {
    const db = getDatabase();

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.title !== undefined) {
        updates.push('title = ?');
        params.push(input.title.trim());
    }

    if (input.description !== undefined) {
        updates.push('description = ?');
        params.push(input.description.trim());
    }

    if (input.dueDate !== undefined) {
        updates.push('due_date = ?');
        params.push(input.dueDate.toISOString());
    }

    if (input.isCompleted !== undefined) {
        updates.push('is_completed = ?');
        params.push(input.isCompleted ? 1 : 0);
    }

    if (updates.length === 0) {
        return getTaskById(id);
    }

    params.push(id);

    const result = await run(
        db,
        `
            UPDATE tasks
            SET ${updates.join(', ')}
            WHERE id = ?
        `,
        params,
    );

    if (result.changes === 0) {
        return null;
    }

    return getTaskById(id);
}

async function toggleTaskComplete(id: number): Promise<Task | null> {
    const db = getDatabase();

    const result = await run(
        db,
        `
            UPDATE tasks
            SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `,
        [id],
    );

    if (result.changes === 0) {
        return null;
    }

    return getTaskById(id);
}

async function deleteTask(id: number): Promise<boolean> {
    const db = getDatabase();

    const result = await run(
        db,
        `
            DELETE
            FROM tasks
            WHERE id = ?
        `,
        [id],
    );

    return result.changes > 0;
}

export {createTask, getTaskById, getAllTasks, updateTask, toggleTaskComplete, deleteTask};

