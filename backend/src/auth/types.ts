import type { z } from 'zod';
import type { loginRequestSchema } from './schemas.js';

type LoginRequest = z.infer<typeof loginRequestSchema>;

type UserDbRow = {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
};

type UserResponse = {
    id: number;
    email: string;
    createdAt: string;
};

type CreateUserInput = {
    email: string;
    passwordHash: string;
};

type AuthTokenPayload = {
    userId: number;
    email: string;
};

function mapUserDbRowToUser(row: UserDbRow): UserResponse {
    return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
    };
}

export { mapUserDbRowToUser };

export type { LoginRequest, UserDbRow, UserResponse, CreateUserInput, AuthTokenPayload };

