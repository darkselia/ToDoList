import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../auth/jwt.js';
import type { AuthTokenPayload } from '../auth/types.js';

type AuthenticatedRequest = Request & { user?: AuthTokenPayload };

function authenticateRequest(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'];
    const tokenValue = Array.isArray(token) ? token[0] : token;
    const resolvedToken = tokenValue?.trim() || null;
    if (!resolvedToken) {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                message: 'x-access-token header is required.',
            },
        });
        return;
    }

    try {
        const payload = verifyAccessToken(resolvedToken);
        (req as AuthenticatedRequest).user = payload;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: {
                code: 401,
                message: 'Invalid or expired access token.',
            },
        });
    }
}

export { authenticateRequest };
export type { AuthenticatedRequest };

