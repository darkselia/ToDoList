import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'backend' });
});

app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
});
