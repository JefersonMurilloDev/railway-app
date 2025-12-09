import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { AppErrorClass } from '../middleware/errorHandler.js';

/**
 * GET /api/tasks
 * Obtener todas las tareas del usuario actual
 */
export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const tasks = await Task.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(tasks);
};

/**
 * GET /api/tasks/:id
 * Obtener una tarea por ID (solo si pertenece al usuario)
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    res.json(task);
};

/**
 * POST /api/tasks
 * Crear una nueva tarea asociada al usuario
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
    const { title, description, priority, dueDate } = req.body;
    const task = new Task({
        title,
        description,
        priority,
        dueDate,
        userId: req.user!._id
    });
    await task.save();
    res.status(201).json(task);
};

/**
 * PUT /api/tasks/:id
 * Actualizar una tarea (solo si pertenece al usuario)
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, completed, priority, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
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
 * Eliminar una tarea (solo si pertenece al usuario)
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    res.json({ message: 'Tarea eliminada correctamente' });
};

/**
 * PATCH /api/tasks/:id/toggle
 * Alternar estado completado (solo si pertenece al usuario)
 */
export const toggleTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!task) {
        return next(new AppErrorClass('Tarea no encontrada', 404));
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
};
