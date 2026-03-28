import express from 'express';
import cors from 'cors';

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get('/api/health', (_req, res) => {
        res.json({ ok: true, service: 'backend' });
    });

    return app;
}

const app = createApp();

export { app, createApp };

