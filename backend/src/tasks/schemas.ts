import { z } from 'zod';

const taskSortFieldSchema = z.enum(['createdAt', 'dueDate', 'status']);
const sortOrderSchema = z.enum(['asc', 'desc']);
const taskStatusFilterSchema = z.enum(['all', 'active', 'completed', 'overdue']);

const createTaskBodySchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().default(''),
    dueDate: z.string().min(1),
    isCompleted: z.boolean().optional(),
});

const updateTaskBodySchema = z
    .object({
        title: z.string().trim().min(1).optional(),
        description: z.string().trim().optional(),
        dueDate: z.string().min(1).optional(),
        isCompleted: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: 'No fields provided for update.',
    });

const taskIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const singleQueryValueSchema = z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value[0] : value));

const taskQuerySchema = z.object({
    status: singleQueryValueSchema.pipe(taskStatusFilterSchema).optional(),
    search: singleQueryValueSchema.optional(),
    dueDateFrom: singleQueryValueSchema.optional(),
    dueDateTo: singleQueryValueSchema.optional(),
    sortBy: singleQueryValueSchema.pipe(taskSortFieldSchema).optional(),
    order: singleQueryValueSchema.pipe(sortOrderSchema).optional(),
});

const taskFiltersSchema = z.object({
    userId: z.number().int().positive(),
    status: taskStatusFilterSchema.optional(),
    search: z.string().optional(),
    dueDateFrom: z.string().optional(),
    dueDateTo: z.string().optional(),
    sortBy: taskSortFieldSchema.optional(),
    order: sortOrderSchema.optional(),
});

export {
    taskSortFieldSchema,
    sortOrderSchema,
    taskStatusFilterSchema,
    createTaskBodySchema,
    updateTaskBodySchema,
    taskIdParamsSchema,
    taskQuerySchema,
    taskFiltersSchema,
};

export type CreateTaskBodyInput = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBodyInput = z.infer<typeof updateTaskBodySchema>;
export type TaskSortFieldInput = z.infer<typeof taskSortFieldSchema>;
export type SortOrderInput = z.infer<typeof sortOrderSchema>;
export type TaskStatusFilterInput = z.infer<typeof taskStatusFilterSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;


