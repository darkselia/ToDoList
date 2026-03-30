import express from 'express';
import cors from 'cors';
import { tasksRouter } from './tasks/routes.js';
import { authRouter } from './auth/routes.js';
import { authenticateRequest } from './middleware/auth.js';

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());


    app.use('/api/auth', authRouter);
    app.use('/api/tasks', authenticateRequest, tasksRouter);

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

        const isDev = process.env.NODE_ENV !== 'production';
        const errorMessage = error instanceof Error ? error.message : 'Internal server error.';
        const message = isDev ? errorMessage : 'Internal server error.';

        console.error('Unhandled server error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message,
            },
        });
    });

    return app;
}

const app = createApp();

export { app, createApp };

