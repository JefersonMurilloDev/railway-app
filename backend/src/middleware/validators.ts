import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que verifica el resultado de las validaciones
 * y devuelve errores si existen
 */
export const handleValidation = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            status: 'fail',
            message: 'Datos de entrada inválidos',
            errors: errors.array().map(err => ({
                field: 'path' in err ? err.path : 'unknown',
                message: err.msg
            }))
        });
        return;
    }

    next();
};

/**
 * Validaciones para crear una tarea
 */
export const validateCreateTask = [
    body('title')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ max: 100 }).withMessage('El título no puede exceder 100 caracteres')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
        .escape(),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Prioridad debe ser: low, medium o high'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Fecha de vencimiento debe ser una fecha válida ISO8601'),

    handleValidation
];

/**
 * Validaciones para actualizar una tarea
 */
export const validateUpdateTask = [
    param('id')
        .isMongoId().withMessage('ID de tarea inválido'),

    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('El título no puede estar vacío')
        .isLength({ max: 100 }).withMessage('El título no puede exceder 100 caracteres')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
        .escape(),

    body('completed')
        .optional()
        .isBoolean().withMessage('Completed debe ser un valor booleano'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Prioridad debe ser: low, medium o high'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Fecha de vencimiento debe ser una fecha válida ISO8601'),

    handleValidation
];

/**
 * Validaciones para operaciones con ID
 */
export const validateTaskId = [
    param('id')
        .isMongoId().withMessage('ID de tarea inválido'),

    handleValidation
];

/**
 * Validaciones para registro de usuario
 */
export const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ max: 50 }).withMessage('El nombre no puede exceder 50 caracteres')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

    handleValidation
];

/**
 * Validaciones para login
 */
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),

    handleValidation
];

