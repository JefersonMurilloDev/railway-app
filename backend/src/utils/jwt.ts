import jwt, { SignOptions } from 'jsonwebtoken';

// SEGURIDAD: En producción, JWT_SECRET DEBE estar definido en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Advertencia en producción si no hay secret configurado
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('⚠️ ADVERTENCIA: JWT_SECRET no está configurado en producción!');
    process.exit(1);
}

export interface JwtPayload {
    id: string;
    iat?: number;
    exp?: number;
}

/**
 * Genera un token JWT para el usuario
 */
export const generateToken = (userId: string): string => {
    const options: SignOptions = {};
    if (JWT_EXPIRES_IN) {
        options.expiresIn = JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];
    }
    return jwt.sign({ id: userId }, JWT_SECRET, options);
};

/**
 * Verifica y decodifica un token JWT
 */
export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export { JWT_SECRET, JWT_EXPIRES_IN };
