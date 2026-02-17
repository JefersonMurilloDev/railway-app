import { Request, Response, NextFunction } from 'express';

// Mock del modelo User
jest.mock('../../models/User.js', () => ({
    User: {
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        create: jest.fn(),
    }
}));

// Mock del modelo Task
jest.mock('../../models/Task.js', () => ({
    Task: {
        deleteMany: jest.fn(),
    }
}));

// Mock del modelo Account
jest.mock('../../models/Account.js', () => ({
    Account: {
        deleteMany: jest.fn(),
    }
}));

// Mock del modelo Expense
jest.mock('../../models/Expense.js', () => ({
    Expense: {
        deleteMany: jest.fn(),
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
import { Task } from '../../models/Task.js';
import { Account } from '../../models/Account.js';
import { Expense } from '../../models/Expense.js';
import { generateToken } from '../../utils/jwt.js';
import { register, login, getMe, deleteAccount } from '../../controllers/authController.js';

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

    describe('deleteAccount', () => {
        it('debería eliminar el usuario y todos sus datos asociados en cascada', async () => {
            const mockUser = {
                _id: 'user-id-123',
                name: 'Test User',
                email: 'test@example.com'
            };

            // Configurar mocks para que resuelvan correctamente
            (Expense.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });
            (Account.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });
            (Task.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 10 });
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

            const req = mockRequest({ user: mockUser as any });
            const res = mockResponse();

            await deleteAccount(req as Request, res as Response);

            // Verificar que se eliminaron en el orden correcto
            expect(Expense.deleteMany).toHaveBeenCalledWith({ userId: 'user-id-123' });
            expect(Account.deleteMany).toHaveBeenCalledWith({ userId: 'user-id-123' });
            expect(Task.deleteMany).toHaveBeenCalledWith({ userId: 'user-id-123' });
            expect(User.findByIdAndDelete).toHaveBeenCalledWith('user-id-123');

            // Verificar respuesta exitosa
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Cuenta eliminada correctamente junto con todos los datos asociados'
            });
        });

        it('debería eliminar datos aunque el usuario no tenga gastos, cuentas o tareas', async () => {
            const mockUser = {
                _id: 'new-user-id',
                name: 'New User',
                email: 'new@example.com'
            };

            // Usuario sin datos
            (Expense.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
            (Account.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
            (Task.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

            const req = mockRequest({ user: mockUser as any });
            const res = mockResponse();

            await deleteAccount(req as Request, res as Response);

            // Todas las operaciones deben ejecutarse sin error
            expect(Expense.deleteMany).toHaveBeenCalled();
            expect(Account.deleteMany).toHaveBeenCalled();
            expect(Task.deleteMany).toHaveBeenCalled();
            expect(User.findByIdAndDelete).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });
});
