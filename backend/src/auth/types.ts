type UserDbRow = {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
};

type User = {
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

function mapUserDbRowToUser(row: UserDbRow): User {
    return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
    };
}

export { mapUserDbRowToUser };
export type { UserDbRow, User, CreateUserInput, AuthTokenPayload };

