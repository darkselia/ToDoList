import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from './types.js';

function requireJwtSecret() {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        throw new Error('JWT_SECRET is not set.');
    }

    return secret;
}

function signAccessToken(payload: AuthTokenPayload) {
    return jwt.sign(payload, requireJwtSecret(), { expiresIn: '1d' });
}

function verifyAccessToken(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, requireJwtSecret());
    if (typeof decoded !== 'object' || decoded === null) {
        throw new Error('Invalid token payload.');
    }

    const payload = decoded as AuthTokenPayload;
    if (!payload.userId || !payload.email) {
        throw new Error('Invalid token payload.');
    }

    return payload;
}

export { signAccessToken, verifyAccessToken };

