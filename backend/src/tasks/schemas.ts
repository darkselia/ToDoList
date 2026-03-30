import {z} from 'zod';

const taskSortFieldSchema = z.enum(['createdAt', 'dueDate', 'status']);
const sortOrderSchema = z.enum(['asc', 'desc']);
const taskStatusFilterSchema = z.enum(['all', 'active', 'completed', 'overdue']);

const dateBaseSchema = z.coerce.date().refine((value) => !Number.isNaN(value.getTime()), {
    message: 'Invalid date.',
});

const dateYmdSchema = dateBaseSchema
    .min(new Date(Date.now()), { message: 'Date must be in the future.' })
;

const taskBodyBaseSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim(),
    dueDate: dateYmdSchema,
    isCompleted: z.boolean().optional(),
});

const createTaskBodySchema = taskBodyBaseSchema.extend({
    description: taskBodyBaseSchema.shape.description.default(''),

});

const updateTaskBodySchema = taskBodyBaseSchema
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

const singleQueryDateSchema = z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    dateBaseSchema,
);

const taskDateRangeBaseSchema = z.object({
    dueDateFrom: dateBaseSchema.optional(),
    dueDateTo: dateBaseSchema.optional(),
});

const taskQuerySchema = taskDateRangeBaseSchema.extend({
    status: singleQueryValueSchema.pipe(taskStatusFilterSchema).optional(),
    search: singleQueryValueSchema.optional(),
    dueDateFrom: singleQueryDateSchema.optional(),
    dueDateTo: singleQueryDateSchema.optional(),
    sortBy: singleQueryValueSchema.pipe(taskSortFieldSchema).optional(),
    order: singleQueryValueSchema.pipe(sortOrderSchema).optional(),
});

const taskFiltersSchema = taskDateRangeBaseSchema.extend({
    userId: z.number().int().positive(),
    status: taskStatusFilterSchema.optional(),
    search: z.string().optional(),
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


