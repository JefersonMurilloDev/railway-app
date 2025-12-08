import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { validateCreateTask, validateUpdateTask, validateTaskId } from '../middleware/validators.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleTask
} from '../controllers/taskController.js';

const router = Router();

// GET /api/tasks - Obtener todas las tareas
router.get('/', asyncHandler(getTasks));

// GET /api/tasks/:id - Obtener una tarea por ID
router.get('/:id', validateTaskId, asyncHandler(getTaskById));

// POST /api/tasks - Crear una nueva tarea
router.post('/', createLimiter, validateCreateTask, asyncHandler(createTask));

// PUT /api/tasks/:id - Actualizar una tarea
router.put('/:id', validateUpdateTask, asyncHandler(updateTask));

// DELETE /api/tasks/:id - Eliminar una tarea
router.delete('/:id', validateTaskId, asyncHandler(deleteTask));

// PATCH /api/tasks/:id/toggle - Alternar estado completado
router.patch('/:id/toggle', validateTaskId, asyncHandler(toggleTask));

export default router;
