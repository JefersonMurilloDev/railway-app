import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { register, login, getMe, deleteAccount } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register - Registrar usuario
router.post('/register', authLimiter, validateRegister, asyncHandler(register));

// POST /api/auth/login - Iniciar sesión
router.post('/login', authLimiter, validateLogin, asyncHandler(login));

// GET /api/auth/me - Obtener usuario actual (protegido)
router.get('/me', asyncHandler(protect), asyncHandler(getMe));

// DELETE /api/auth/me - Eliminar cuenta y todos los datos asociados (protegido)
router.delete('/me', asyncHandler(protect), asyncHandler(deleteAccount));

export default router;
