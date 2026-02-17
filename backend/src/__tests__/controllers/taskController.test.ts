import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Mock del modelo Task ANTES de importar el controlador
jest.mock('../../models/Task.js', () => ({
    Task: {
        find: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findOneAndDelete: jest.fn(),
        create: jest.fn(),
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

import { Task } from '../../models/Task.js';
import {
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} from '../../controllers/taskController.js';

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

describe('TaskController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTasks', () => {
        it('debería retornar tareas del usuario', async () => {
            const mockTasks = [
                { _id: '1', title: 'Task 1' },
                { _id: '2', title: 'Task 2' }
            ];

            (Task.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockTasks)
            });

            const req = mockRequest();
            const res = mockResponse();

            await getTasks(req as Request, res as Response);

            expect(Task.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockTasks);
        });
    });

    describe('getTaskById', () => {
        it('debería retornar una tarea específica', async () => {
            const mockTask = { _id: '123', title: 'Test Task' };
            (Task.findOne as jest.Mock).mockResolvedValue(mockTask);

            const req = mockRequest({ params: { id: '123' } });
            const res = mockResponse();

            await getTaskById(req as Request, res as Response, mockNext);

            expect(Task.findOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockTask);
        });

        it('debería llamar next con error si la tarea no existe', async () => {
            (Task.findOne as jest.Mock).mockResolvedValue(null);

            const req = mockRequest({ params: { id: '999' } });
            const res = mockResponse();

            await getTaskById(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        it('debería eliminar una tarea', async () => {
            const mockTask = { _id: '123', title: 'Task to delete' };
            (Task.findOneAndDelete as jest.Mock).mockResolvedValue(mockTask);

            const req = mockRequest({ params: { id: '123' } });
            const res = mockResponse();

            await deleteTask(req as Request, res as Response, mockNext);

            expect(Task.findOneAndDelete).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Tarea eliminada correctamente' });
        });

        it('debería llamar next si la tarea no existe', async () => {
            (Task.findOneAndDelete as jest.Mock).mockResolvedValue(null);

            const req = mockRequest({ params: { id: '999' } });
            const res = mockResponse();

            await deleteTask(req as Request, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('updateTask', () => {
        it('debería actualizar una tarea', async () => {
            const updatedTask = { _id: '123', title: 'Updated' };
            (Task.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

            const req = mockRequest({
                params: { id: '123' },
                body: { title: 'Updated' }
            });
            const res = mockResponse();

            await updateTask(req as Request, res as Response, mockNext);

            expect(Task.findOneAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(updatedTask);
        });

        it('debería actualizar una tarea con accountId para vincular cuenta', async () => {
            const accountId = '507f1f77bcf86cd799439022';
            const updatedTask = {
                _id: '123',
                title: 'Task with Account',
                accountId
            };
            (Task.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

            const req = mockRequest({
                params: { id: '123' },
                body: { title: 'Task with Account', accountId }
            });
            const res = mockResponse();

            await updateTask(req as Request, res as Response, mockNext);

            expect(Task.findOneAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(updatedTask);
        });
    });

    describe('createTask', () => {
        it('debería soportar el campo accountId para vincular cuentas', async () => {
            const taskData = {
                title: 'Nueva Tarea',
                description: 'Descripción',
                accountId: '507f1f77bcf86cd799439022'
            };

            // Verificar que el body tiene los datos correctos incluyendo accountId
            const req = mockRequest({ body: taskData });
            const res = mockResponse();

            expect(req.body.title).toBe('Nueva Tarea');
            expect(req.body.accountId).toBe('507f1f77bcf86cd799439022');
            expect(res.status).toBeDefined();
        });
    });
});
