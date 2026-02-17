import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas
 * 100 peticiones por IP cada 15 minutos
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite por ventana
    message: {
        status: 'fail',
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter más estricto para creación de recursos
 * 20 creaciones por IP cada 15 minutos
 */
export const createLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // límite por ventana
    message: {
        status: 'fail',
        message: 'Has creado demasiadas tareas, intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter para endpoints sensibles (futuro: auth)
 * 5 intentos por IP cada 15 minutos
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // límite por ventana
    message: {
        status: 'fail',
        message: 'Demasiados intentos, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false
});
