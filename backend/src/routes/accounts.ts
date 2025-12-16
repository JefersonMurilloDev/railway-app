import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountStats,
} from '../controllers/accountController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(asyncHandler(protect));

// GET /api/accounts/stats - Obtener estadísticas generales
router.get('/stats', asyncHandler(getAccountStats));

// GET /api/accounts - Obtener todas las cuentas del usuario
router.get('/', asyncHandler(getAccounts));

// GET /api/accounts/:id - Obtener una cuenta por ID con gastos
router.get('/:id', asyncHandler(getAccountById));

// POST /api/accounts - Crear una nueva cuenta
router.post('/', createLimiter, asyncHandler(createAccount));

// PUT /api/accounts/:id - Actualizar una cuenta
router.put('/:id', asyncHandler(updateAccount));

// DELETE /api/accounts/:id - Eliminar una cuenta
router.delete('/:id', asyncHandler(deleteAccount));

export default router;
