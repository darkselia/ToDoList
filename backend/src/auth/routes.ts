import { Router, type Response } from 'express';
import type { ZodType } from 'zod';
import bcrypt from 'bcrypt';
import { loginBodySchema } from './schemas.js';
import { createUser, getUserWithPasswordByEmail } from './repository.js';
import { signAccessToken } from './jwt.js';

const authRouter = Router();

const BCRYPT_SALT_ROUNDS = 10;

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
        const issueMessage = issue?.message || fallbackMessage;
        const message = fieldPath ? `Invalid parameter "${fieldPath}": ${issueMessage}` : fallbackMessage;
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

authRouter.post('/login', async (req, res) => {
    const bodyData = parseOrBadRequest(res, loginBodySchema, req.body, 'Invalid request body.');
    if (!bodyData) {
        return;
    }

    const email = bodyData.email.trim().toLowerCase();
    const password = bodyData.password;

    const existingUser = await getUserWithPasswordByEmail(email);
    if (!existingUser) {
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const createdUser = await createUser({ email, passwordHash });
        const token = signAccessToken({ userId: createdUser.id, email: createdUser.email });

        res.status(201).json({
            success: true,
            data: {
                token,
                user: createdUser,
            },
            error: null,
        });
        return;
    }

    const passwordMatches = await bcrypt.compare(password, existingUser.password_hash);
    if (!passwordMatches) {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                message: 'Invalid email or password.',
            },
        });
        return;
    }

    const token = signAccessToken({ userId: existingUser.id, email: existingUser.email });

    res.status(200).json({
        success: true,
        data: {
            token,
            user: {
                id: existingUser.id,
                email: existingUser.email,
                createdAt: existingUser.created_at,
            },
        },
        error: null,
    });
});

authRouter.post('/logout', (_req, res) => {
    res.status(200).json({
        success: true,
        data: { loggedOut: true },
        error: null,
    });
});

export { authRouter };


