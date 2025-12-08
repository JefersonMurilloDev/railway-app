import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface AppError extends Error {
    statusCode?: number;
    status?: string;
}

/**
 * Middleware global para manejo de errores
 * Captura todos los errores y devuelve respuestas consistentes
 */
const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';

    // Manejar errores de validación de Mongoose
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        message = messages.join(', ');
    }

    // Manejar errores de CastError (ID inválido)
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Valor inválido para ${err.path}: ${err.value}`;
    }

    // Log del error en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error:', err);
    }

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Clase para crear errores personalizados con código de estado
 */
export class AppErrorClass extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

export default errorHandler;
