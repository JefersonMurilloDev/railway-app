import { Router, Request, Response } from 'express';
import { Task } from '../models/Task.js';

const router = Router();

// GET /api/tasks - Obtener todas las tareas
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
});

// GET /api/tasks/:id - Obtener una tarea por ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la tarea' });
    }
});

// POST /api/tasks - Crear una nueva tarea
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const task = new Task({ title, description, priority, dueDate });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error al crear la tarea' });
        }
    }
});

// PUT /api/tasks/:id - Actualizar una tarea
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, completed, priority, dueDate } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, completed, priority, dueDate },
            { new: true, runValidators: true }
        );
        if (!task) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.json(task);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error al actualizar la tarea' });
        }
    }
});

// DELETE /api/tasks/:id - Eliminar una tarea
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
});

// PATCH /api/tasks/:id/toggle - Alternar estado completado
router.patch('/:id/toggle', async (req: Request, res: Response): Promise<void> => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

export default router;
