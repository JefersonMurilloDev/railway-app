import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper para manejar errores en funciones async sin necesidad de try-catch
 * Captura errores y los pasa al middleware de errores
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncHandler;
