import dotenv from 'dotenv';
import { app } from './app.js';
import { initializeDatabase } from './db/sqlite.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`API started on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize backend:', error);
        process.exit(1);
    }
}

void bootstrap();
