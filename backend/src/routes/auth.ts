import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { register, login, getMe } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/register - Registrar usuario
router.post('/register', authLimiter, validateRegister, asyncHandler(register));

// POST /api/auth/login - Iniciar sesión
router.post('/login', authLimiter, validateLogin, asyncHandler(login));

// GET /api/auth/me - Obtener usuario actual (protegido)
router.get('/me', asyncHandler(protect), asyncHandler(getMe));

export default router;
