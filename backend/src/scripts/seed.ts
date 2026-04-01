import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { get, getDatabase, initializeDatabase, run } from '../db/sqlite.js';

dotenv.config();

type SeedUser = {
    email: string;
    password: string;
};

type SeedTask = {
    title: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
};

type UserIdRow = { id: number };

const BCRYPT_SALT_ROUNDS = 10;

const USERS: SeedUser[] = [
    { email: 'demo@example.com', password: 'secret123' },
    { email: 'demo2@example.com', password: 'secret123' },
];

const TASKS_BY_EMAIL: Record<string, SeedTask[]> = {
    'demo@example.com': [
        {
            title: 'Prepare monthly report',
            description: 'Collect metrics and prepare summary slides.',
            dueDate: '2026-05-05T09:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Book dentist appointment',
            description: 'Call clinic and book visit for next week.',
            dueDate: '2026-05-12T11:30:00.000Z',
            isCompleted: true,
        },
        {
            title: 'Refactor auth middleware',
            description: 'Improve token error handling paths.',
            dueDate: '2026-05-20T16:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, and fruits.',
            dueDate: '2026-05-08T18:00:00.000Z',
            isCompleted: true,
        },
        {
            title: 'Write API documentation',
            description: 'Document auth and tasks endpoints.',
            dueDate: '2026-05-07T10:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Team sprint planning',
            description: 'Prepare priorities for sprint meeting.',
            dueDate: '2026-05-10T13:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Close old backlog tickets',
            description: 'Review and close obsolete tasks.',
            dueDate: '2026-05-18T15:30:00.000Z',
            isCompleted: true,
        },
    ],
    'demo2@example.com': [
        {
            title: 'Write API documentation',
            description: 'Document auth and tasks endpoints.',
            dueDate: '2026-05-07T10:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Team sprint planning',
            description: 'Prepare priorities for sprint meeting.',
            dueDate: '2026-05-10T13:00:00.000Z',
            isCompleted: false,
        },
        {
            title: 'Close old backlog tickets',
            description: 'Review and close obsolete tasks.',
            dueDate: '2026-05-18T15:30:00.000Z',
            isCompleted: true,
        },
    ],
};

async function ensureUser(user: SeedUser): Promise<number> {
    const db = getDatabase();
    const normalizedEmail = user.email.trim().toLowerCase();

    const existing = await get<UserIdRow>(
        db,
        `
            SELECT id
            FROM users
            WHERE email = ?
        `,
        [normalizedEmail],
    );

    if (existing) {
        return existing.id;
    }

    const passwordHash = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
    const result = await run(
        db,
        `
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
        `,
        [normalizedEmail, passwordHash],
    );

    return result.lastID;
}

async function reseedTasksForUser(userId: number, tasks: SeedTask[]) {
    const db = getDatabase();

    await run(
        db,
        `
            DELETE
            FROM tasks
            WHERE created_by = ?
        `,
        [userId],
    );

    for (const task of tasks) {
        await run(
            db,
            `
                INSERT INTO tasks (title, description, due_date, is_completed, created_by)
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                task.title.trim(),
                task.description.trim(),
                task.dueDate,
                task.isCompleted ? 1 : 0,
                userId,
            ],
        );
    }
}

async function seed() {
    await initializeDatabase();

    for (const user of USERS) {
        const userId = await ensureUser(user);
        const tasks = TASKS_BY_EMAIL[user.email] ?? [];
        await reseedTasksForUser(userId, tasks);
    }

    console.log('Seed completed: 2 users and tasks were inserted.');
}

seed().catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
});

