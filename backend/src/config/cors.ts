import type { CorsOptions } from 'cors';

function resolveAllowedOrigins() {
    const rawOrigins = process.env.CORS_ORIGIN?.trim();
    if (!rawOrigins) {
        return ['http://localhost:3000'];
    }

    return rawOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
}

function createCorsOptions(): CorsOptions {
    const allowedOrigins = resolveAllowedOrigins();
    const isDev = process.env.NODE_ENV !== 'production';

    return {
        origin(origin, callback) {
            // Allow requests without Origin (curl/Postman/server-to-server).
            if (!origin && isDev) {
                callback(null, true);
                return;
            }

            if (allowedOrigins.includes(origin!)) {
                callback(null, true);
                return;
            }

            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'x-access-token'],
        optionsSuccessStatus: 204,
        credentials: false,
    };
}

export { createCorsOptions };

