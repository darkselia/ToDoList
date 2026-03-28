import express from 'express';
import cors from 'cors';
import { tasksRouter } from './tasks/routes.js';

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api/tasks', tasksRouter);

    app.get('/api/health', (_req, res) => {
        res.status(200).json({
            success: true,
            data: { ok: true, service: 'backend' },
            error: null,
        });
    });

    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            data: { hello: 'world!', service: 'backend' },
            error: null,
        });
    });

    return app;
}

const app = createApp();

export { app, createApp };

