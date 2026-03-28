import { Router, type Response } from 'express';
import type { ZodType } from 'zod';
import {
    createTask,
    deleteTask,
    getAllTasks,
    getTaskById,
    updateTask,
} from './repository.js';
import {
    createTaskBodySchema,
    taskFiltersSchema,
    taskIdParamsSchema,
    taskQuerySchema,
    updateTaskBodySchema,
    userIdHeaderSchema,
} from './schemas.js';

const tasksRouter = Router();

function getValidationMessage(message: string, fieldPath?: string) {
    if (fieldPath === 'x-user-id' || message.includes('x-user-id')) {
        return 'x-user-id header is required and must be a positive integer.';
    }

    if (fieldPath === 'dueDate' || message.includes('dueDate')) {
        return 'dueDate is required.';
    }

    if (fieldPath === 'title' || message.includes('title')) {
        return 'title is required.';
    }

    if (fieldPath) {
        return `Invalid parameter "${fieldPath}": ${message}`;
    }

    return message;
}

function parseOrBadRequest<T>(
    res: Response,
    schema: ZodType<T>,
    payload: unknown,
    fallbackMessage: string,
): T | null {
    const parsedResult = schema.safeParse(payload);
    if (!parsedResult.success) {
        const issue = parsedResult.error.issues[0];
        const fieldPath = issue?.path?.map((part) => String(part)).join('.');
        const message = getValidationMessage(issue?.message || fallbackMessage, fieldPath);
        res.status(400).json({
            success: false,
            error: {
                code: 400,
                message,
            },
        });
        return null;
    }

    return parsedResult.data;
}

function parseHeaderUserId(res: Response, headers: unknown) {
    return parseOrBadRequest(
        res,
        userIdHeaderSchema,
        headers,
        'x-user-id header is required and must be a positive integer.',
    );
}

tasksRouter.get('/', async (req, res) => {
    try {
        const headerData = parseHeaderUserId(res, req.headers);
        if (!headerData) {
            return;
        }

        const queryData = parseOrBadRequest(res, taskQuerySchema, req.query, 'Invalid query params.');
        if (!queryData) {
            return;
        }

        const filters = parseOrBadRequest(
            res,
            taskFiltersSchema,
            {
                userId: headerData['x-user-id'],
                ...queryData,
            },
            'Invalid query params.',
        );
        if (!filters) {
            return;
        }

        const tasks = await getAllTasks(filters);

        res.status(200).json({
            success: true,
            data: tasks,
            error: null,
        });
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Failed to fetch tasks.',
            },
        });
    }
});

tasksRouter.post('/', async (req, res) => {
    try {
        const headerData = parseHeaderUserId(res, req.headers);
        if (!headerData) {
            return;
        }

        const bodyData = parseOrBadRequest(res, createTaskBodySchema, req.body, 'Invalid request body.');
        if (!bodyData) {
            return;
        }

        const { title, description, dueDate, isCompleted } = bodyData;

        const createdTask = await createTask({
            title,
            description,
            dueDate,
            isCompleted,
            createdBy: headerData['x-user-id'],
        });

        res.status(201).json({
            success: true,
            data: createdTask,
            error: null,
        });
    } catch (error) {
        console.error('Failed to create task:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Failed to create task.',
            },
        });
    }
});

tasksRouter.put('/:id', async (req, res) => {
    try {
        const headerData = parseHeaderUserId(res, req.headers);
        if (!headerData) {
            return;
        }

        const paramsData = parseOrBadRequest(res, taskIdParamsSchema, req.params, 'Task id must be a positive integer.');
        if (!paramsData) {
            return;
        }
        const taskId = paramsData.id;

        const updatesData = parseOrBadRequest(res, updateTaskBodySchema, req.body, 'Invalid request body.');
        if (!updatesData) {
            return;
        }

        const existingTask = await getTaskById(taskId);
        if (!existingTask || existingTask.createdBy !== headerData['x-user-id']) {
            res.status(404).json({
                success: false,
                error: {
                    code: 404,
                    message: 'Task not found.',
                },
            });
            return;
        }

        const updatedTask = await updateTask(taskId, updatesData);
        if (!updatedTask) {
            res.status(404).json({
                success: false,
                error: {
                    code: 404,
                    message: 'Task not found.',
                },
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: updatedTask,
            error: null,
        });
    } catch (error) {
        console.error('Failed to update task:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Failed to update task.',
            },
        });
    }
});

tasksRouter.delete('/:id', async (req, res) => {
    try {
        const headerData = parseHeaderUserId(res, req.headers);
        if (!headerData) {
            return;
        }

        const paramsData = parseOrBadRequest(res, taskIdParamsSchema, req.params, 'Task id must be a positive integer.');
        if (!paramsData) {
            return;
        }
        const taskId = paramsData.id;

        const existingTask = await getTaskById(taskId);
        if (!existingTask || existingTask.createdBy !== headerData['x-user-id']) {
            res.status(404).json({
                success: false,
                error: {
                    code: 404,
                    message: 'Task not found.',
                },
            });
            return;
        }

        const isDeleted = await deleteTask(taskId);
        if (!isDeleted) {
            res.status(404).json({
                success: false,
                error: {
                    code: 404,
                    message: 'Task not found.',
                },
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                deleted: true,
                id: taskId,
            },
            error: null,
        });
    } catch (error) {
        console.error('Failed to delete task:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Failed to delete task.',
            },
        });
    }
});

export { tasksRouter };


