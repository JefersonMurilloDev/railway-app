import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Account } from '../models/Account.js';
import { Expense } from '../models/Expense.js';
import { generateToken } from '../utils/jwt.js';
import { AppErrorClass } from '../middleware/errorHandler.js';

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppErrorClass('Ya existe una cuenta con este email', 400));
    }

    // Crear usuario
    const user = await User.create({ name, email, password });

    // Generar token
    const token = generateToken(user._id.toString());

    res.status(201).json({
        status: 'success',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    // Verificar que se enviaron email y password
    if (!email || !password) {
        return next(new AppErrorClass('Por favor proporciona email y contraseña', 400));
    }

    // Buscar usuario con password (select: false por defecto)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new AppErrorClass('Credenciales inválidas', 401));
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return next(new AppErrorClass('Credenciales inválidas', 401));
    }

    // Generar token
    const token = generateToken(user._id.toString());

    res.json({
        status: 'success',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
};

/**
 * GET /api/auth/me
 * Obtener usuario actual (protegido)
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
    // req.user ya está disponible gracias al middleware protect
    res.json({
        status: 'success',
        user: req.user
    });
};

/**
 * DELETE /api/auth/me
 * Eliminar cuenta del usuario y todos sus datos asociados (cascada)
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    // Borrado en cascada: eliminar todos los datos del usuario
    // 1. Eliminar todos los gastos
    await Expense.deleteMany({ userId });

    // 2. Eliminar todas las cuentas
    await Account.deleteMany({ userId });

    // 3. Eliminar todas las tareas
    await Task.deleteMany({ userId });

    // 4. Eliminar el usuario
    await User.findByIdAndDelete(userId);

    res.json({
        status: 'success',
        message: 'Cuenta eliminada correctamente junto con todos los datos asociados'
    });
};
