import { z } from 'zod';

const loginRequestSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export { loginRequestSchema };

