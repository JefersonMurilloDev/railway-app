import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import {
    getExpenses,
    getExpenseById,
    getExpenseImage,
    createExpense,
    updateExpense,
    deleteExpense,
} from '../controllers/expenseController.js';

const router = Router();

// Configuración de multer con memoryStorage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        // Solo permitir imágenes y PDFs
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF, WebP) y PDF.'));
        }
    },
});

// GET /api/expenses/:id/image - Obtener imagen del recibo (público para poder ver con <a href>)
router.get('/:id/image', asyncHandler(getExpenseImage));

// Las siguientes rutas requieren autenticación
router.use(asyncHandler(protect));

// GET /api/expenses - Obtener todos los gastos (filtrar por ?accountId=xxx)
router.get('/', asyncHandler(getExpenses));

// GET /api/expenses/:id - Obtener un gasto por ID
router.get('/:id', asyncHandler(getExpenseById));

// POST /api/expenses - Crear un nuevo gasto (con imagen opcional)
router.post('/', createLimiter, upload.single('receipt'), asyncHandler(createExpense));

// PUT /api/expenses/:id - Actualizar un gasto (con imagen opcional)
router.put('/:id', upload.single('receipt'), asyncHandler(updateExpense));

// DELETE /api/expenses/:id - Eliminar un gasto
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
