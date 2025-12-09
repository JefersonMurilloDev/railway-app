import { Request, Response, NextFunction } from 'express';

// Mock del modelo User
jest.mock('../../models/User.js', () => ({
    User: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
    }
}));

// Mock de jwt utilities
jest.mock('../../utils/jwt.js', () => ({
    generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
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
import { generateToken } from '../../utils/jwt.js';
import { register, login, getMe } from '../../controllers/authController.js';

// Helper para crear mock de Request
const mockRequest = (options: Partial<Request> = {}): Partial<Request> => ({
    params: {},
    body: {},
    user: undefined,
    ...options
});

// Helper para crear mock de Response
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('debería registrar un usuario nuevo y retornar token', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const mockUser = {
                _id: 'user-id-123',
                name: userData.name,
                email: userData.email
            };

            (User.findOne as jest.Mock).mockResolvedValue(null); // No existe usuario
            (User.create as jest.Mock).mockResolvedValue(mockUser);

            const req = mockRequest({ body: userData });
            const res = mockResponse();

            await register(req as Request, res as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
            expect(User.create).toHaveBeenCalledWith(userData);
            expect(generateToken).toHaveBeenCalledWith('user-id-123');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                token: 'mock-jwt-token',
                user: {
                    id: 'user-id-123',
                    name: userData.name,
                    email: userData.email
                }
            });
        });

        it('debería fallar si el email ya existe', async () => {
            const existingUser = { email: 'existing@example.com' };
            (User.findOne as jest.Mock).mockResolvedValue(existingUser);

            const req = mockRequest({
                body: { name: 'Test', email: 'existing@example.com', password: 'pass123' }
            });
            const res = mockResponse();

            await register(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(User.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('debería hacer login con credenciales válidas', async () => {
            const mockUser = {
                _id: 'user-id-123',
                name: 'Test User',
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const req = mockRequest({
                body: { email: 'test@example.com', password: 'password123' }
            });
            const res = mockResponse();

            await login(req as Request, res as Response, mockNext);

            expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
            expect(generateToken).toHaveBeenCalledWith('user-id-123');
            expect(res.json).toHaveBeenCalled();
        });

        it('debería fallar con contraseña incorrecta', async () => {
            const mockUser = {
                _id: 'user-id-123',
                comparePassword: jest.fn().mockResolvedValue(false)
            };

            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const req = mockRequest({
                body: { email: 'test@example.com', password: 'wrongpassword' }
            });
            const res = mockResponse();

            await login(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        it('debería fallar si el usuario no existe', async () => {
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            const req = mockRequest({
                body: { email: 'noexiste@example.com', password: 'pass' }
            });
            const res = mockResponse();

            await login(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('getMe', () => {
        it('debería retornar el usuario actual', async () => {
            const mockUser = {
                _id: 'user-id-123',
                name: 'Test User',
                email: 'test@example.com'
            };

            const req = mockRequest({ user: mockUser as any });
            const res = mockResponse();

            await getMe(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                user: mockUser
            });
        });
    });
});
