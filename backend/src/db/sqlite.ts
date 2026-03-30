import {dirname, resolve} from 'node:path';
import sqlite3 from 'sqlite3';
import {mkdir} from "node:fs";

const DB_PATH = process.env.DB_PATH?.trim() || './data/database.sqlite';

type SqliteRunResult = {
    lastID: number;
    changes: number;
};

let database: sqlite3.Database | null = null;

function openDatabase(filePath: string) {
    return new Promise<sqlite3.Database>((resolveDb, rejectDb) => {
        const db = new sqlite3.Database(filePath, (error) => {
            if (error) {
                rejectDb(error);
                return;
            }

            resolveDb(db);
        });
    });
}

function run(db: sqlite3.Database, sql: string, params: unknown[] = []) {
    return new Promise<SqliteRunResult>((resolveRun, rejectRun) => {
        db.run(sql, params, function onRun(error) {
            if (error) {
                rejectRun(error);
                return;
            }

            resolveRun({
                lastID: this.lastID,
                changes: this.changes,
            });
        });
    });
}

function get<T>(db: sqlite3.Database, sql: string, params: unknown[] = []) {
    return new Promise<T | undefined>((resolveGet, rejectGet) => {
        db.get(sql, params, (error, row) => {
            if (error) {
                rejectGet(error);
                return;
            }

            resolveGet(row as T | undefined);
        });
    });
}

function all<T>(db: sqlite3.Database, sql: string, params: unknown[] = []) {
    return new Promise<T[]>((resolveAll, rejectAll) => {
        db.all(sql, params, (error, rows) => {
            if (error) {
                rejectAll(error);
                return;
            }

            resolveAll(rows as T[]);
        });
    });
}

async function initializeDatabase() {
    const dbFilePath = resolve(DB_PATH);

    await new Promise<void>((resolveMkdir, rejectMkdir) => {
        mkdir(dirname(dbFilePath), { recursive: true }, (error) => {
            if (error) {
                rejectMkdir(error);
                return;
            }

            resolveMkdir();
        });
    });

    const db = await openDatabase(dbFilePath);

    await run(
        db,
        `
            CREATE TABLE IF NOT EXISTS users
            (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT    NOT NULL UNIQUE,
                password_hash TEXT    NOT NULL,
                created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        `,
    );

    await run(
        db,
        `
            CREATE TABLE IF NOT EXISTS tasks
            (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                title        TEXT    NOT NULL,
                description  TEXT    NOT NULL DEFAULT '',
                due_date     TEXT    NOT NULL,
                is_completed INTEGER NOT NULL DEFAULT 0,
                created_by   INTEGER NOT NULL,
                created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        `,
    );

    database = db;
    return db;
}

function getDatabase() {
    if (!database) {
        throw new Error('Database is not initialized. Call initializeDatabase() first.');
    }

    return database;
}

export { initializeDatabase, getDatabase, run, get, all };
export type { SqliteRunResult };

