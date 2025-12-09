import { Request, Response, NextFunction } from 'express';

// Mock del modelo User
jest.mock('../../models/User.js', () => ({
    User: {
        findById: jest.fn()
    }
}));

// Mock de jwt utilities
jest.mock('../../utils/jwt.js', () => ({
    verifyToken: jest.fn()
}));

jest.mock('../../middleware/errorHandler.js', () => ({
    AppErrorClass: class AppErrorClass extends Error {
        statusCode: number;
        constructor(message: string, statusCode: number) {
            super(message);
            this.statusCode = statusCode;
        }
    }
}));

import { User } from '../../models/User.js';
import { verifyToken } from '../../utils/jwt.js';
import { protect } from '../../middleware/auth.js';

// Helpers
const mockRequest = (options: Partial<Request> = {}): Partial<Request> => ({
    headers: {},
    ...options
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('Auth Middleware - protect', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería llamar next() con error si no hay token', async () => {
        const req = mockRequest({ headers: {} });
        const res = mockResponse();

        await protect(req as Request, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error.message).toContain('autenticado');
    });

    it('debería llamar next() con error si el token es inválido', async () => {
        (verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const req = mockRequest({
            headers: { authorization: 'Bearer invalid-token' }
        });
        const res = mockResponse();

        await protect(req as Request, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('debería agregar user a req si el token es válido', async () => {
        const mockUser = { _id: 'user-123', name: 'Test', email: 'test@test.com' };

        (verifyToken as jest.Mock).mockReturnValue({ id: 'user-123' });
        (User.findById as jest.Mock).mockResolvedValue(mockUser);

        const req = mockRequest({
            headers: { authorization: 'Bearer valid-token' }
        });
        const res = mockResponse();

        await protect(req as Request, res as Response, mockNext);

        expect(verifyToken).toHaveBeenCalledWith('valid-token');
        expect(User.findById).toHaveBeenCalledWith('user-123');
        expect((req as any).user).toEqual(mockUser);
        expect(mockNext).toHaveBeenCalledWith(); // sin argumentos = éxito
    });

    it('debería fallar si el usuario del token no existe', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: 'deleted-user' });
        (User.findById as jest.Mock).mockResolvedValue(null);

        const req = mockRequest({
            headers: { authorization: 'Bearer valid-token-deleted-user' }
        });
        const res = mockResponse();

        await protect(req as Request, res as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        const error = (mockNext as jest.Mock).mock.calls[0][0];
        expect(error).toBeDefined();
    });
});
