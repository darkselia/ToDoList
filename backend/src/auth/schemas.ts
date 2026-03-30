import { z } from 'zod';

const loginBodySchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export { loginBodySchema };
