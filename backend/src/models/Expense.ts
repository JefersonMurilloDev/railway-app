import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    description: string;
    amount: number;
    date: Date;
    category: string;
    receiptData?: Buffer;
    receiptContentType?: string;
    accountId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
    {
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            trim: true,
            maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
        },
        amount: {
            type: Number,
            required: [true, 'El monto es requerido'],
        },
        date: {
            type: Date,
            required: [true, 'La fecha es requerida'],
            default: Date.now,
        },
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        receiptData: {
            type: Buffer,
            default: null,
        },
        receiptContentType: {
            type: String,
            default: null,
        },
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'La cuenta es requerida'],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El usuario es requerido'],
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Índices para búsquedas frecuentes
expenseSchema.index({ accountId: 1, date: -1 });
expenseSchema.index({ userId: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
