import { Request, Response, NextFunction } from 'express';
import { Account } from '../models/Account.js';
import { Expense } from '../models/Expense.js';
import { AppErrorClass } from '../middleware/errorHandler.js';

/**
 * GET /api/accounts
 * Obtener todas las cuentas del usuario actual
 */
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
    const accounts = await Account.find({ userId: req.user!._id }).sort({ createdAt: -1 });

    // Calcular balance actual para cada cuenta (saldo inicial - gastos)
    const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => {
            const expenses = await Expense.find({ accountId: account._id });
            const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const currentBalance = account.initialBalance - totalExpenses;

            return {
                ...account.toObject(),
                currentBalance,
                totalExpenses,
            };
        })
    );

    res.json(accountsWithBalance);
};

/**
 * GET /api/accounts/:id
 * Obtener una cuenta por ID con sus gastos
 */
export const getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user!._id });

    if (!account) {
        return next(new AppErrorClass('Cuenta no encontrada', 404));
    }

    // Obtener gastos asociados (sin incluir el buffer de imagen para optimizar)
    const expenses = await Expense.find({ accountId: account._id })
        .select('-receiptData')
        .sort({ date: -1 });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentBalance = account.initialBalance - totalExpenses;

    res.json({
        ...account.toObject(),
        currentBalance,
        totalExpenses,
        expenses,
    });
};

/**
 * POST /api/accounts
 * Crear una nueva cuenta
 */
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    const { name, initialBalance, type, currency, color } = req.body;

    const account = new Account({
        name,
        initialBalance: initialBalance || 0,
        type: type || 'corriente',
        currency: currency || 'USD',
        color: color || '#7C3AED',
        userId: req.user!._id,
    });

    await account.save();
    res.status(201).json(account);
};

/**
 * PUT /api/accounts/:id
 * Actualizar una cuenta
 */
export const updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, initialBalance, type, currency, color } = req.body;

    const account = await Account.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        { name, initialBalance, type, currency, color },
        { new: true, runValidators: true }
    );

    if (!account) {
        return next(new AppErrorClass('Cuenta no encontrada', 404));
    }

    res.json(account);
};

/**
 * DELETE /api/accounts/:id
 * Eliminar una cuenta y sus gastos asociados
 */
export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });

    if (!account) {
        return next(new AppErrorClass('Cuenta no encontrada', 404));
    }

    // Eliminar también todos los gastos asociados
    await Expense.deleteMany({ accountId: account._id });

    res.json({ message: 'Cuenta y gastos asociados eliminados correctamente' });
};

/**
 * GET /api/accounts/stats
 * Obtener estadísticas generales del usuario
 */
export const getAccountStats = async (req: Request, res: Response): Promise<void> => {
    const accounts = await Account.find({ userId: req.user!._id });

    // Calcular totales
    let totalBalance = 0;
    let totalExpensesThisMonth = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const account of accounts) {
        const allExpenses = await Expense.find({ accountId: account._id });
        const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        totalBalance += account.initialBalance - totalExpenses;

        // Gastos de este mes
        const monthExpenses = await Expense.find({
            accountId: account._id,
            date: { $gte: startOfMonth },
        });
        totalExpensesThisMonth += monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }

    res.json({
        totalBalance,
        totalAccounts: accounts.length,
        totalExpensesThisMonth,
    });
};
