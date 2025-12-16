import { Request, Response, NextFunction } from 'express';
import { Expense } from '../models/Expense.js';
import { Account } from '../models/Account.js';
import { AppErrorClass } from '../middleware/errorHandler.js';

/**
 * GET /api/expenses
 * Obtener todos los gastos del usuario (opcionalmente filtrados por cuenta)
 */
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
    const { accountId } = req.query;

    const filter: Record<string, unknown> = { userId: req.user!._id };
    if (accountId) {
        filter.accountId = accountId;
    }

    // No incluir el buffer de imagen para optimizar la respuesta
    const expenses = await Expense.find(filter)
        .select('-receiptData')
        .sort({ date: -1 });

    // Añadir flag hasReceipt a cada gasto
    const expensesWithFlag = expenses.map(expense => ({
        ...expense.toObject(),
        hasReceipt: !!expense.receiptContentType,
    }));

    res.json(expensesWithFlag);
};

/**
 * GET /api/expenses/:id
 * Obtener un gasto por ID
 */
export const getExpenseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user!._id })
        .select('-receiptData');

    if (!expense) {
        return next(new AppErrorClass('Gasto no encontrado', 404));
    }

    res.json(expense);
};

/**
 * GET /api/expenses/:id/image
 * Obtener la imagen del recibo de un gasto (público para visualización directa)
 */
export const getExpenseImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new AppErrorClass('Gasto no encontrado', 404));
    }

    if (!expense.receiptData || !expense.receiptContentType) {
        return next(new AppErrorClass('Este gasto no tiene imagen de recibo', 404));
    }

    res.set('Content-Type', expense.receiptContentType);
    res.send(expense.receiptData);
};

/**
 * POST /api/expenses
 * Crear un nuevo gasto (con opción de subir imagen)
 */
export const createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { description, amount, date, category, accountId } = req.body;

    // Verificar que la cuenta existe y pertenece al usuario
    const account = await Account.findOne({ _id: accountId, userId: req.user!._id });
    if (!account) {
        return next(new AppErrorClass('Cuenta no encontrada', 404));
    }

    const expenseData: Record<string, unknown> = {
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        category: category || 'General',
        accountId,
        userId: req.user!._id,
    };

    // Si hay archivo subido, guardar el buffer
    if (req.file) {
        expenseData.receiptData = req.file.buffer;
        expenseData.receiptContentType = req.file.mimetype;
    }

    const expense = new Expense(expenseData);
    await expense.save();

    // Excluir el buffer de la respuesta y añadir hasReceipt
    const responseExpense = {
        ...expense.toObject(),
        hasReceipt: !!expense.receiptContentType,
    };
    delete responseExpense.receiptData;

    res.status(201).json(responseExpense);
};

/**
 * PUT /api/expenses/:id
 * Actualizar un gasto
 */
export const updateExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { description, amount, date, category } = req.body;

    const updateData: Record<string, unknown> = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (category !== undefined) updateData.category = category;

    // Si hay nueva imagen
    if (req.file) {
        updateData.receiptData = req.file.buffer;
        updateData.receiptContentType = req.file.mimetype;
    }

    const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        updateData,
        { new: true, runValidators: true }
    );

    if (!expense) {
        return next(new AppErrorClass('Gasto no encontrado', 404));
    }

    // Incluir hasReceipt y excluir buffer
    const responseExpense = {
        ...expense.toObject(),
        hasReceipt: !!expense.receiptContentType,
    };
    delete responseExpense.receiptData;

    res.json(responseExpense);
};

/**
 * DELETE /api/expenses/:id
 * Eliminar un gasto
 */
export const deleteExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });

    if (!expense) {
        return next(new AppErrorClass('Gasto no encontrado', 404));
    }

    res.json({ message: 'Gasto eliminado correctamente' });
};
