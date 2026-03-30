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

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: {
                code: 404,
                message: `Route not found: ${req.method} ${req.originalUrl}`,
            },
        });
    });

    app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (res.headersSent) {
            next(error);
            return;
        }

        console.error('Unhandled server error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Internal server error.',
            },
        });
    });

    return app;
}

const app = createApp();

export { app, createApp };

