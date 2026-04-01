import {all, get, getDatabase, run} from '../db/sqlite.js';
import {mapTaskDbRowToTask} from './types.js';
import type {
    CreateTaskInput,
    TaskResponse,
    TaskDbRow,
    TaskListResult,
    TaskFiltersRequest,
    TaskSortField,
    SortOrder,
    UpdateTaskRequest,
} from './types.js';

function resolveSortColumn(sortBy: TaskSortField = 'createdAt') {
    switch (sortBy) {
        case 'title':
            return 'title';
        case 'dueDate':
            return 'due_date';
        case 'createdAt':
            return 'created_at';
        case 'status':
        default:
            return 'is_completed';
    }
}

function resolveSortOrder(order: SortOrder = 'desc') {
    return order === 'asc' ? 'ASC' : 'DESC';
}

async function createTask(input: CreateTaskInput): Promise<TaskResponse> {
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

async function getTaskById(id: number): Promise<TaskResponse | null> {
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

async function getAllTasks(filters: TaskFiltersRequest): Promise<TaskListResult> {
    const db = getDatabase();
    const sortColumn = resolveSortColumn(filters.sortBy);
    const sortOrder = resolveSortOrder(filters.order);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

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

    const countRow = await get<{ total: number }>(
        db,
        `
            SELECT COUNT(*) as total
            FROM tasks
            WHERE ${whereClauses.join(' AND ')}
        `,
        params,
    );

    const total = countRow?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const rows = await all<TaskDbRow>(
        db,
        `
            SELECT id, title, description, due_date, is_completed, created_by, created_at
            FROM tasks
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY ${sortColumn} ${sortOrder}
            LIMIT ? OFFSET ?
        `,
        [...params, limit, offset],
    );

    return {
        items: rows.map(mapTaskDbRowToTask),
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

async function updateTask(id: number, input: UpdateTaskRequest): Promise<TaskResponse | null> {
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

async function toggleTaskComplete(id: number): Promise<TaskResponse | null> {
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

