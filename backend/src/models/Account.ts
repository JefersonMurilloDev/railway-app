import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
    name: string;
    initialBalance: number;
    type: 'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro';
    currency: 'USD' | 'COP' | 'EUR';
    color: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
    {
        name: {
            type: String,
            required: [true, 'El nombre de la cuenta es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        initialBalance: {
            type: Number,
            required: [true, 'El saldo inicial es requerido'],
            default: 0,
        },
        type: {
            type: String,
            enum: ['corriente', 'ahorros', 'efectivo', 'credito', 'otro'],
            default: 'corriente',
        },
        currency: {
            type: String,
            enum: ['USD', 'COP', 'EUR'],
            default: 'USD',
        },
        color: {
            type: String,
            default: '#7C3AED', // Purple por defecto
            trim: true,
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

// Índice compuesto para búsquedas por usuario
accountSchema.index({ userId: 1, createdAt: -1 });

export const Account = mongoose.model<IAccount>('Account', accountSchema);
