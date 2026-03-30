import { get, getDatabase, run } from '../db/sqlite.js';
import { mapUserDbRowToUser } from './types.js';
import type { CreateUserInput, User, UserDbRow } from './types.js';

async function getUserByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    const row = await get<UserDbRow>(
        db,
        `
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE email = ?
        `,
        [email.trim().toLowerCase()],
    );

    return row ? mapUserDbRowToUser(row) : null;
}

async function getUserWithPasswordByEmail(email: string): Promise<UserDbRow | null> {
    const db = getDatabase();
    const row = await get<UserDbRow>(
        db,
        `
            SELECT id, email, password_hash, created_at
            FROM users
            WHERE email = ?
        `,
        [email.trim().toLowerCase()],
    );

    return row ?? null;
}

async function createUser(input: CreateUserInput): Promise<User> {
    const db = getDatabase();
    const result = await run(
        db,
        `
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
        `,
        [input.email.trim().toLowerCase(), input.passwordHash],
    );

    const created = await getUserByEmail(input.email);
    if (!created) {
        throw new Error('Failed to create user.');
    }

    return created;
}

export { getUserByEmail, getUserWithPasswordByEmail, createUser };

