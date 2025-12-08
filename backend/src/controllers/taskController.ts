import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { AppErrorClass } from '../middleware/errorHandler.js';

/**
 * GET /api/tasks
 * Obtener todas las tareas
 */
export const getTasks = async (_req: Request, res: Response): Promise<void> => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
};

/**
 * GET /api/tasks/:id
 * Obtener una tarea por ID
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    res.json(task);
};

/**
 * POST /api/tasks
 * Crear una nueva tarea
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
    const { title, description, priority, dueDate } = req.body;
    const task = new Task({ title, description, priority, dueDate });
    await task.save();
    res.status(201).json(task);
};

/**
 * PUT /api/tasks/:id
 * Actualizar una tarea
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, completed, priority, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, completed, priority, dueDate },
        { new: true, runValidators: true }
    );

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    res.json(task);
};

/**
 * DELETE /api/tasks/:id
 * Eliminar una tarea
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    res.json({ message: 'Tarea eliminada correctamente' });
};

/**
 * PATCH /api/tasks/:id/toggle
 * Alternar estado completado
 */
export const toggleTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
};
