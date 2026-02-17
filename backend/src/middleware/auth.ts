import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { AppErrorClass } from './errorHandler.js';

// Extender Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

/**
 * Middleware para proteger rutas
 * Verifica el token JWT y agrega el usuario a req.user
 */
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Obtener token del header
        let token: string | undefined;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppErrorClass('No estás autenticado. Por favor inicia sesión', 401));
        }

        // 2. Verificar token
        const decoded = verifyToken(token);

        // 3. Verificar que el usuario aún existe
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppErrorClass('El usuario de este token ya no existe', 401));
        }

        // 4. Agregar usuario al request
        req.user = user;
        next();
    } catch {
        return next(new AppErrorClass('Token inválido o expirado', 401));
    }
};
