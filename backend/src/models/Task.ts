import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
            maxlength: [100, 'El título no puede exceder 100 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
        },
        completed: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Índice para búsquedas frecuentes
taskSchema.index({ completed: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
