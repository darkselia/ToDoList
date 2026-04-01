import { z } from 'zod';

const taskSortFieldSchema = z.enum(['createdAt', 'dueDate', 'status', 'title']);
const sortOrderSchema = z.enum(['asc', 'desc']);
const taskStatusFilterSchema = z.enum(['all', 'active', 'completed', 'overdue']);

const dateBaseSchema = z.coerce.date().refine((value) => !Number.isNaN(value.getTime()), {
    message: 'Invalid date.',
});

const dateYmdSchema = dateBaseSchema.min(new Date(Date.now()), { message: 'Date must be in the future.' });

const taskRequestBaseSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim(),
    dueDate: dateYmdSchema,
    isCompleted: z.boolean().optional(),
});

const createTaskRequestSchema = taskRequestBaseSchema.extend({
    description: taskRequestBaseSchema.shape.description.default(''),
});

const updateTaskRequestSchema = taskRequestBaseSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'No fields provided for update.',
    });

const taskIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const singleQueryValueSchema = z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value[0] : value));

const singleQueryNumberSchema = z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    z.coerce.number().int().positive(),
);

const singleQueryDateSchema = z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    dateBaseSchema,
);

const taskDateRangeSchema = z.object({
    dueDateFrom: dateBaseSchema.optional(),
    dueDateTo: dateBaseSchema.optional(),
});

const taskQueryRequestSchema = taskDateRangeSchema.extend({
    status: singleQueryValueSchema.pipe(taskStatusFilterSchema).optional(),
    search: singleQueryValueSchema.optional(),
    dueDateFrom: singleQueryDateSchema.optional(),
    dueDateTo: singleQueryDateSchema.optional(),
    sortBy: singleQueryValueSchema.pipe(taskSortFieldSchema).optional(),
    order: singleQueryValueSchema.pipe(sortOrderSchema).optional(),
    page: singleQueryNumberSchema.optional(),
    limit: singleQueryNumberSchema.pipe(z.number().max(100)).optional(),
});

const taskFiltersSchema = taskDateRangeSchema.extend({
    userId: z.number().int().positive(),
    status: taskStatusFilterSchema.optional(),
    search: z.string().optional(),
    sortBy: taskSortFieldSchema.optional(),
    order: sortOrderSchema.optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
});

export {
    taskSortFieldSchema,
    sortOrderSchema,
    taskStatusFilterSchema,
    createTaskRequestSchema,
    updateTaskRequestSchema,
    taskIdParamsSchema,
    taskQueryRequestSchema,
    taskFiltersSchema,
};

