import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Mock del modelo Account ANTES de importar el controlador
jest.mock('../../models/Account.js', () => ({
    Account: {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findOneAndDelete: jest.fn(),
        create: jest.fn(),
    }
}));

// Mock del modelo Expense
jest.mock('../../models/Expense.js', () => ({
    Expense: {
        find: jest.fn(),
        deleteMany: jest.fn(),
    }
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

import { Account } from '../../models/Account.js';
import { Expense } from '../../models/Expense.js';
import {
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
} from '../../controllers/accountController.js';

// Helper para crear mock de Request
const mockRequest = (options: Partial<Request> = {}): Partial<Request> => ({
    params: {},
    body: {},
    user: { _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') } as unknown as Express.Request['user'],
    ...options
});

// Helper para crear mock de Response
const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock de NextFunction
const mockNext: NextFunction = jest.fn();

describe('AccountController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAccounts', () => {
        it('debería retornar cuentas del usuario con balance calculado', async () => {
            const mockAccounts = [
                {
                    _id: 'account-1',
                    name: 'Cuenta Principal',
                    initialBalance: 1000000,
                    toObject: jest.fn().mockReturnValue({
                        _id: 'account-1',
                        name: 'Cuenta Principal',
                        initialBalance: 1000000
                    })
                }
            ];
            const mockExpenses = [
                { amount: 200000 },
                { amount: 100000 }
            ];

            (Account.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockAccounts)
            });
            (Expense.find as jest.Mock).mockResolvedValue(mockExpenses);

            const req = mockRequest();
            const res = mockResponse();

            await getAccounts(req as Request, res as Response);

            expect(Account.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();

            // Verificar que se calculó el balance correcto
            const callArgs = (res.json as jest.Mock).mock.calls[0][0];
            expect(callArgs[0].currentBalance).toBe(700000); // 1000000 - 300000
            expect(callArgs[0].totalExpenses).toBe(300000);
        });

        it('debería retornar array vacío si el usuario no tiene cuentas', async () => {
            (Account.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });

            const req = mockRequest();
            const res = mockResponse();

            await getAccounts(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe('getAccountById', () => {
        it('debería retornar una cuenta específica con sus gastos', async () => {
            const mockAccount = {
                _id: 'account-123',
                name: 'Cuenta Test',
                initialBalance: 500000,
                toObject: jest.fn().mockReturnValue({
                    _id: 'account-123',
                    name: 'Cuenta Test',
                    initialBalance: 500000
                })
            };
            const mockExpenses = [{ amount: 50000 }];

            (Account.findOne as jest.Mock).mockResolvedValue(mockAccount);
            (Expense.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockExpenses)
                })
            });

            const req = mockRequest({ params: { id: 'account-123' } });
            const res = mockResponse();

            await getAccountById(req as Request, res as Response, mockNext);

            expect(Account.findOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('debería llamar next con error si la cuenta no existe', async () => {
            (Account.findOne as jest.Mock).mockResolvedValue(null);

            const req = mockRequest({ params: { id: '999' } });
            const res = mockResponse();

            await getAccountById(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('createAccount', () => {
        it('debería aceptar datos válidos para crear una cuenta', () => {
            const accountData = {
                name: 'Nueva Cuenta',
                initialBalance: 100000,
                type: 'corriente',
                currency: 'COP',
                color: '#7C3AED'
            };

            const req = mockRequest({ body: accountData });
            const res = mockResponse();

            // Verificar que el body tiene la estructura esperada
            expect(req.body.name).toBe('Nueva Cuenta');
            expect(req.body.initialBalance).toBe(100000);
            expect(req.body.type).toBe('corriente');
            expect(req.body.currency).toBe('COP');
            expect(req.body.color).toBe('#7C3AED');
            expect(res.status).toBeDefined();
        });
    });

    describe('updateAccount', () => {
        it('debería actualizar una cuenta existente', async () => {
            const updatedAccount = {
                _id: 'account-123',
                name: 'Cuenta Actualizada',
                initialBalance: 200000
            };

            (Account.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedAccount);

            const req = mockRequest({
                params: { id: 'account-123' },
                body: { name: 'Cuenta Actualizada', initialBalance: 200000 }
            });
            const res = mockResponse();

            await updateAccount(req as Request, res as Response, mockNext);

            expect(Account.findOneAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(updatedAccount);
        });

        it('debería llamar next si la cuenta no existe', async () => {
            (Account.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

            const req = mockRequest({
                params: { id: '999' },
                body: { name: 'Test' }
            });
            const res = mockResponse();

            await updateAccount(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('deleteAccount', () => {
        it('debería eliminar una cuenta y sus gastos asociados', async () => {
            const mockAccount = { _id: 'account-123', name: 'Cuenta a eliminar' };
            (Account.findOneAndDelete as jest.Mock).mockResolvedValue(mockAccount);
            (Expense.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });

            const req = mockRequest({ params: { id: 'account-123' } });
            const res = mockResponse();

            await deleteAccount(req as Request, res as Response, mockNext);

            expect(Account.findOneAndDelete).toHaveBeenCalled();
            expect(Expense.deleteMany).toHaveBeenCalledWith({ accountId: 'account-123' });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Cuenta y gastos asociados eliminados correctamente'
            });
        });

        it('debería llamar next si la cuenta no existe', async () => {
            (Account.findOneAndDelete as jest.Mock).mockResolvedValue(null);

            const req = mockRequest({ params: { id: '999' } });
            const res = mockResponse();

            await deleteAccount(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(Expense.deleteMany).not.toHaveBeenCalled();
        });
    });
});
